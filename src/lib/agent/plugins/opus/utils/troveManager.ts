import { num, Account, Call, Contract, GetTransactionReceiptResponse } from 'starknet';
import { parseUnits } from 'ethers';
import { StarknetAgentInterface } from 'src/lib/agent/tools/tools';
import { BorrowTroveResult, DepositTroveResult, OpenTroveResult, RepayTroveResult } from '../interfaces';
import { AssetBalance, AssetBalances, AssetBalancesInput, BorrowTroveParams, DepositTroveParams, forgeFeePaidEventSchema, healthSchema, OpenTroveParams, RepayTroveParams, troveOpenedEventSchema, Wad, wadSchema } from '../schemas';
import { getAbbotContract, getErc20Contract, getSentinelContract, getShrineContract } from './contracts';
import { tokenAddresses } from '../../core/token/constants/erc20';

const FORGE_FEE_PAID_EVENT_IDENTIFIER = 'opus::core::shrine::shrine::ForgeFeePaid';

export class TroveManager {
  shrine: Contract;
  abbot: Contract;
  sentinel: Contract;

  constructor(
    private agent: StarknetAgentInterface,
    private walletAddress: string
  ) {}

  async initialise() {
    const chainId = await this.agent.getProvider().getChainId();
    this.shrine = getShrineContract(chainId);
    this.abbot = getAbbotContract(chainId);
    this.sentinel = getSentinelContract(chainId);
  }

  getBorrowFeeFromEvent(txReceipt: GetTransactionReceiptResponse): [string, string] {
    const shrineEvents = this.shrine.parseEvents(txReceipt);
    
    const forgeFeePaidEvent = forgeFeePaidEventSchema.parse(
      shrineEvents.find(event => FORGE_FEE_PAID_EVENT_IDENTIFIER in event)![FORGE_FEE_PAID_EVENT_IDENTIFIER]
    );
    return [forgeFeePaidEvent.fee.formatted, forgeFeePaidEvent.fee_pct.formatted];
  }

  async parseMaxBorrowFeePctWithCheck(borrowFeePct: string): Promise<bigint> {
    const maxBorrowFeePct = parseUnits(
      borrowFeePct,
      16, // 1% is equivalent to 10 ** 16
    );
    const currentBorrowFeePct: Wad = await this.shrine.get_forge_fee_pct();
    if (maxBorrowFeePct < currentBorrowFeePct.value) {
      throw new Error(`Max borrow fee of ${maxBorrowFeePct}% is lower than current: ${currentBorrowFeePct.formatted}%`);
    }

    return maxBorrowFeePct;
  }

  async approveAssetBalancesForSentinel(
    assetBalances: AssetBalances,
    sentinelAddress: string,
  ): Promise<Call[]> {

    return Array.from(assetBalances ?? []).map(( assetBalance ) => {
      const tokenContract = getErc20Contract(assetBalance.address);

      const approveCall = tokenContract.populateTransaction.approve(
        sentinelAddress,
        assetBalance.amount,
      );

      return {
        contractAddress: approveCall.contractAddress,
        entrypoint: approveCall.entrypoint,
        calldata: approveCall.calldata,
      };
    });
  }

  async prepareCollateralDeposits(collaterals: AssetBalancesInput): Promise<[AssetBalances, Call[]]> {
    const yangs = (await this.sentinel.get_yang_addresses()).map((yang: string) => num.toBigInt(yang));

    let assetBalances: AssetBalances = [];
    let approveAssetsCalls: Call[] = [];

    await Promise.all(
      collaterals.map(async (collateral) => {
        const collateralAddress = tokenAddresses[collateral.symbol];
        if (!yangs.includes(num.toBigInt(collateralAddress))) {
          throw new Error(`${collateralAddress} is not a valid collateral`);
        }

        const asset = getErc20Contract(collateralAddress);
        const gate = await this.sentinel.get_gate_address(collateralAddress);
        const collateralDecimals = await asset.decimals();
        const collateralAmount = parseUnits(
          collateral.amount,
          collateralDecimals,
        );

        const assetBalance: AssetBalance = {
          address: collateralAddress,
          amount: collateralAmount,
        };
        assetBalances.push(assetBalance);

        const approveCall = asset.populateTransaction.approve(
          gate,
          assetBalance.amount,
        );
  
        approveAssetsCalls.push({
          contractAddress: approveCall.contractAddress,
          entrypoint: approveCall.entrypoint,
          calldata: approveCall.calldata,
        });
      })
    );

    return [assetBalances, approveAssetsCalls];
  }

  async openTroveTransaction(
    params: OpenTroveParams,
    agent: StarknetAgentInterface
  ): Promise<OpenTroveResult> {
    await this.initialise();
    try {
      const account = new Account(
        this.agent.contractInteractor.provider,
        this.walletAddress,
        this.agent.getAccountCredentials().accountPrivateKey
      );

      const [assetBalances, approveAssetsCalls] = await this.prepareCollateralDeposits(params.collaterals);
      const borrowAmount = parseUnits(params.borrowAmount, 18);
      const maxBorrowFeePct = await this.parseMaxBorrowFeePctWithCheck(params.maxBorrowFeePct);

      const openTroveCall =
        await this.abbot.populateTransaction.open_trove(
          assetBalances,
          { val: borrowAmount },
          { val: maxBorrowFeePct },
        );

      const tx = await account.execute([
        ...approveAssetsCalls,
        {
          contractAddress: openTroveCall.contractAddress,
          entrypoint: openTroveCall.entrypoint,
          calldata: openTroveCall.calldata,
        },
      ]);

      const provider = agent.getProvider();
      const txReceipt = await provider.waitForTransaction(tx.transaction_hash)

      let troveId;
      let borrowFeePaid;
      let borrowFeePct;
      if (txReceipt.isSuccess()) {
        const abbotEvents = this.abbot.parseEvents(txReceipt);
        const troveOpenedIdentifier = 'opus::core::abbot::abbot::TroveOpened';
        const troveOpenedEvent = abbotEvents.find(event => troveOpenedIdentifier in event)![troveOpenedIdentifier];
        const parsedTroveOpenedEvent = troveOpenedEventSchema.parse(
          troveOpenedEvent
        );
        troveId = parsedTroveOpenedEvent.trove_id.toString();

        [borrowFeePaid, borrowFeePct] = this.getBorrowFeeFromEvent(txReceipt);
      }

      const openTroveResult: OpenTroveResult = {
        status: 'success',
        trove_id: troveId,
        borrow_fee: borrowFeePaid,
        borrow_fee_pct: borrowFeePct,
        transaction_hash: tx.transaction_hash,
      };

      return openTroveResult;
    } catch (error) {
      console.error('Detailed open trove error:', error);
      if (error instanceof Error) {
        console.error('Error type:', error.constructor.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      return {
        status: 'failure',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async depositTransaction(
    params: DepositTroveParams,
    agent: StarknetAgentInterface
  ): Promise<DepositTroveResult> {
    await this.initialise();
    try {
      const account = new Account(
        this.agent.contractInteractor.provider,
        this.walletAddress,
        this.agent.getAccountCredentials().accountPrivateKey
      );

      const [assetBalances, approveAssetsCalls] = await this.prepareCollateralDeposits([params.collateral]);

      const depositCall =
        await this.abbot.populateTransaction.deposit(
          params.troveId,
          assetBalances[0],
        );

      const beforeHealth = healthSchema.parse(
        await this.shrine.get_trove_health(params.troveId)
      );
      const tx = await account.execute([
        ...approveAssetsCalls,
        {
          contractAddress: depositCall.contractAddress,
          entrypoint: depositCall.entrypoint,
          calldata: depositCall.calldata,
        },
      ]);

      const provider = agent.getProvider();
      const txReceipt = await provider.waitForTransaction(tx.transaction_hash)

      let afterHealth;
      if (txReceipt.isSuccess()) {
        afterHealth = healthSchema.parse(
          await this.shrine.get_trove_health(params.troveId)
        );
      }

      const depositResult: DepositTroveResult = {
        status: 'success',
        trove_id: params.troveId.toString(),
        before_value: beforeHealth.value.formatted,
        after_value: afterHealth?.value.formatted,
        before_ltv: beforeHealth.ltv.formatted,
        after_ltv: afterHealth?.ltv.formatted,
        transaction_hash: tx.transaction_hash,
      };

      return depositResult;
    } catch (error) {
      console.error('Detailed deposit error:', error);
      if (error instanceof Error) {
        console.error('Error type:', error.constructor.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      return {
        status: 'failure',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async borrowTransaction(
    params: BorrowTroveParams,
    agent: StarknetAgentInterface
  ): Promise<BorrowTroveResult> {
    await this.initialise();
    try {
      const account = new Account(
        this.agent.contractInteractor.provider,
        this.walletAddress,
        this.agent.getAccountCredentials().accountPrivateKey
      );

      const borrowAmount = parseUnits(params.amount, 18);
      const maxBorrowFeePct = await this.parseMaxBorrowFeePctWithCheck(params.maxBorrowFeePct);
      const borrowCall =
        await this.abbot.populateTransaction.forge(
          params.troveId,
          { val: borrowAmount },
          { val: maxBorrowFeePct},
        );

      const beforeHealth = healthSchema.parse(
        await this.shrine.get_trove_health(params.troveId)
      );
      const tx = await account.execute([
        {
          contractAddress: borrowCall.contractAddress,
          entrypoint: borrowCall.entrypoint,
          calldata: borrowCall.calldata,
        },
      ]);

      const provider = agent.getProvider();
      const txReceipt = await provider.waitForTransaction(tx.transaction_hash)

      let afterHealth;
      let borrowFeePaid;
      let borrowFeePct;
      if (txReceipt.isSuccess()) {
        afterHealth = healthSchema.parse(
          await this.shrine.get_trove_health(params.troveId)
        );

        [borrowFeePaid, borrowFeePct] = this.getBorrowFeeFromEvent(txReceipt);
      }

      const borrowResult: BorrowTroveResult = {
        status: 'success',
        trove_id: params.troveId.toString(),
        amount: borrowAmount.toString(),
        borrow_fee: borrowFeePaid,
        borrow_fee_pct: borrowFeePct,
        before_debt: beforeHealth.debt.formatted,
        after_debt: afterHealth?.debt.formatted,
        before_ltv: beforeHealth.ltv.formatted,
        after_ltv: afterHealth?.ltv.formatted,
        transaction_hash: tx.transaction_hash,
      };

      return borrowResult;
    } catch (error) {
      console.error('Detailed borrow error:', error);
      if (error instanceof Error) {
        console.error('Error type:', error.constructor.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      return {
        status: 'failure',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async repayTransaction(
    params: RepayTroveParams,
    agent: StarknetAgentInterface
  ): Promise<RepayTroveResult> {
    await this.initialise();
    try {
      const account = new Account(
        this.agent.contractInteractor.provider,
        this.walletAddress,
        this.agent.getAccountCredentials().accountPrivateKey
      );

      const repayAmount = parseUnits(
        params.amount,
        18,
      );
      const repayCall =
        await this.abbot.populateTransaction.melt(
          params.troveId,
          { val: repayAmount },
        );

      const beforeHealth = healthSchema.parse(
        await this.shrine.get_trove_health(params.troveId)
      );
      const tx = await account.execute([
        {
          contractAddress: repayCall.contractAddress,
          entrypoint: repayCall.entrypoint,
          calldata: repayCall.calldata,
        },
      ]);

      const provider = agent.getProvider();
      const txReceipt = await provider.waitForTransaction(tx.transaction_hash)

    let afterHealth;
      if (txReceipt.isSuccess()) {
        afterHealth = healthSchema.parse(
          await this.shrine.get_trove_health(params.troveId)
        );
      }

      const repayResult: RepayTroveResult = {
        status: 'success',
        trove_id: params.troveId.toString(),
        amount: repayAmount.toString(),
        before_debt: beforeHealth.debt.formatted,
        after_debt: afterHealth?.debt.formatted,
        before_ltv: beforeHealth.ltv.formatted,
        after_ltv: afterHealth?.ltv.formatted,
        transaction_hash: tx.transaction_hash,
      };

      return repayResult;
    } catch (error) {
      console.error('Detailed repay error:', error);
      if (error instanceof Error) {
        console.error('Error type:', error.constructor.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      return {
        status: 'failure',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export const createTroveManager = (
  agent: StarknetAgentInterface,
  walletAddress?: string
): TroveManager => {
  if (!walletAddress) {
    throw new Error('Wallet address not configured');
  }

  const service = new TroveManager(agent, walletAddress);
  return service;
};
