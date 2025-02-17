import { num, Account, Call, Contract, GetTransactionReceiptResponse } from 'starknet';
import { parseUnits } from 'ethers';
import { StarknetAgentInterface } from 'src/lib/agent/tools/tools';
import { BorrowTroveResult, DepositTroveResult, GetBorrowFeeResult, GetTroveHealthResult, GetUserTrovesResult, OpenTroveResult, RepayTroveResult, WithdrawTroveResult } from '../interfaces';
import { AssetBalance, AssetBalances, AssetBalancesInput, BorrowTroveParams, DepositTroveParams, forgeFeePaidEventSchema, GetTroveHealthParams, GetUserTrovesParams, healthSchema, OpenTroveParams, RepayTroveParams, troveOpenedEventSchema, Wad, wadSchema, WithdrawTroveParams } from '../schemas';
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

  async getUserTroves(params: GetUserTrovesParams): Promise<GetUserTrovesResult> {
    await this.initialise();
    try {
      const troves = await this.abbot.get_user_trove_ids(params.user);
      const formattedTroves = troves.map((troveId: bigint) => {return troveId.toString()});
      const getUserTrovesResult: GetUserTrovesResult = {
        status: 'success',
        troves: formattedTroves,
      };

      return getUserTrovesResult;
    } catch (error) {
      console.error('Detailed get user troves error:', error);
      if (error instanceof Error) {
        console.error('Error type:', error.constructor.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      return {
        status: 'failure',
      };
    }
  }

  async getBorrowFee(): Promise<GetBorrowFeeResult> {
    await this.initialise();
    try {
      const borrowFee = wadSchema.safeParse(
        await this.shrine.get_forge_fee_pct()
      );
      const getBorrowFeeResult: GetBorrowFeeResult = {
        status: 'success',
        borrow_fee: borrowFee.data?.formatted,
      };

      return getBorrowFeeResult;
    } catch (error) {
      console.error('Detailed get borrow fee error:', error);
      if (error instanceof Error) {
        console.error('Error type:', error.constructor.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      return {
        status: 'failure',
      };
    }
  }

  async getTroveHealth(params: GetTroveHealthParams): Promise<GetTroveHealthResult> {
    await this.initialise();
    try {
      const troveHealth = healthSchema.safeParse(
        await this.shrine.get_trove_health(params.troveId)
      );
      const getTroveHealthResult: GetTroveHealthResult = {
        status: 'success',
        debt: troveHealth.data?.debt.formatted,
        value: troveHealth.data?.value.formatted,
        ltv: troveHealth.data?.ltv.formatted,
        threshold: troveHealth.data?.threshold.formatted,
      };

      return getTroveHealthResult;
    } catch (error) {
      console.error('Detailed get trove health error:', error);
      if (error instanceof Error) {
        console.error('Error type:', error.constructor.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      return {
        status: 'failure',
      };
    }
  }

  getBorrowFeeFromEvent(txReceipt: GetTransactionReceiptResponse): [string, string] {
    const shrineEvents = this.shrine.parseEvents(txReceipt);
    
    const forgeFeePaidEvent = forgeFeePaidEventSchema.safeParse(
      shrineEvents.find(event => FORGE_FEE_PAID_EVENT_IDENTIFIER in event)![FORGE_FEE_PAID_EVENT_IDENTIFIER]
    );
    return [forgeFeePaidEvent.data!.fee.formatted, forgeFeePaidEvent.data!.fee_pct.formatted];
  }

  async parseMaxBorrowFeePctWithCheck(borrowFeePct: string): Promise<bigint> {
    const maxBorrowFeePct = parseUnits(
      borrowFeePct,
      16, // 1% is equivalent to 10 ** 16
    );
    const currentBorrowFeePct = wadSchema.safeParse(
      await this.shrine.get_forge_fee_pct()
    );
    if (maxBorrowFeePct < currentBorrowFeePct.data!.value) {
      throw new Error(`Max borrow fee of ${maxBorrowFeePct}% is lower than current: ${currentBorrowFeePct.data!.formatted}%`);
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
        const parsedTroveOpenedEvent = troveOpenedEventSchema.safeParse(
          troveOpenedEvent
        );
        troveId = parsedTroveOpenedEvent.data!.trove_id.toString();

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

      const beforeHealth = healthSchema.safeParse(
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
        afterHealth = healthSchema.safeParse(
          await this.shrine.get_trove_health(params.troveId)
        );
      }

      const depositResult: DepositTroveResult = {
        status: 'success',
        trove_id: params.troveId.toString(),
        before_value: beforeHealth.data?.value.formatted,
        after_value: afterHealth?.data?.value.formatted,
        before_ltv: beforeHealth.data?.ltv.formatted,
        after_ltv: afterHealth?.data?.ltv.formatted,
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

  async withdrawTransaction(
    params: WithdrawTroveParams,
    agent: StarknetAgentInterface
  ): Promise<WithdrawTroveResult> {
    await this.initialise();
    try {
      const account = new Account(
        this.agent.contractInteractor.provider,
        this.walletAddress,
        this.agent.getAccountCredentials().accountPrivateKey
      );

      const [assetBalances, _approveAssetsCalls] = await this.prepareCollateralDeposits([params.collateral]);

      const depositCall =
        await this.abbot.populateTransaction.withdraw(
          params.troveId,
          assetBalances[0],
        );

      const beforeHealth = healthSchema.safeParse(
        await this.shrine.get_trove_health(params.troveId)
      );
      const tx = await account.execute([
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
        afterHealth = healthSchema.safeParse(
          await this.shrine.get_trove_health(params.troveId)
        );
      }

      const withdrawResult: WithdrawTroveResult = {
        status: 'success',
        trove_id: params.troveId.toString(),
        before_value: beforeHealth.data?.value.formatted,
        after_value: afterHealth?.data?.value.formatted,
        before_ltv: beforeHealth.data?.ltv.formatted,
        after_ltv: afterHealth?.data?.ltv.formatted,
        transaction_hash: tx.transaction_hash,
      };

      return withdrawResult;
    } catch (error) {
      console.error('Detailed withdraw error:', error);
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

      const beforeHealth = healthSchema.safeParse(
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
        afterHealth = healthSchema.safeParse(
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
        before_debt: beforeHealth.data?.debt.formatted,
        after_debt: afterHealth?.data?.debt.formatted,
        before_ltv: beforeHealth.data?.ltv.formatted,
        after_ltv: afterHealth?.data?.ltv.formatted,
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

      const beforeHealth = healthSchema.safeParse(
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
        afterHealth = healthSchema.safeParse(
          await this.shrine.get_trove_health(params.troveId)
        );
      }

      const repayResult: RepayTroveResult = {
        status: 'success',
        trove_id: params.troveId.toString(),
        amount: repayAmount.toString(),
        before_debt: beforeHealth.data?.debt.formatted,
        after_debt: afterHealth?.data?.debt.formatted,
        before_ltv: beforeHealth.data?.ltv.formatted,
        after_ltv: afterHealth?.data?.ltv.formatted,
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
