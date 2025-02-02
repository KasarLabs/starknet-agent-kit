import { Account, Call, RpcProvider } from 'starknet';
import { StarknetAgentInterface } from 'src/lib/agent/tools/tools';
import { z } from 'zod';
import { parseUnits } from 'ethers';
import {
  Address,
  addressSchema,
  DepositParams,
  DepositResult,
  IBaseToken,
  IPool,
  IPoolAsset,
  ITokenValue,
  poolParser,
} from './utils/interface';
import {
  DEFAULT_DECIMALS,
  GENESIS_POOLID,
  SINGLETON_ADDRESS,
  VESU_API_URL,
  ZERO,
} from './utils/constants';
import { Hex, toBN, toU256 } from './utils/num';
import {
  getErc20Contract,
  getExtensionContract,
  getSingletonContract,
  getVTokenContract,
} from './contracts';
import { processTransactionCalls } from './utils/processTransactions';

export class DepositEarnService {
  constructor(
    private agent: StarknetAgentInterface,
    private walletAddress: string
  ) {}

  public async getTokenPrice(
    token: IBaseToken,
    poolId: string,
    poolExtension: Hex
  ): Promise<ITokenValue | undefined> {
    const contract = getExtensionContract(poolExtension);

    try {
      const res = await contract.price(poolId, token.address);
      return res.is_valid && res.value
        ? { value: toBN(res.value), decimals: DEFAULT_DECIMALS }
        : undefined;
    } catch (err) {
      console.log('error', err);
      return undefined;
    }
  }

  private async getPoolAssetsPrice(
    poolId: IPool['id'],
    poolExtensionContractAddress: IPool['extensionContractAddress'],
    poolAssets: IPoolAsset[]
  ): Promise<IPoolAsset[]> {
    return await Promise.all(
      poolAssets.map(async (asset) => {
        const [usdPrice] = await Promise.all([
          this.getTokenPrice(asset, poolId, poolExtensionContractAddress),
        ]);

        return {
          ...asset,
          usdPrice,
        };
      })
    );
  }

  // private computePoolStats(poolAssets: IPoolAsset[]): IPool['stats'] {
  //   return poolAssets.reduce(
  //     (acc: IPool['stats'], asset) => {
  //       return asset.usdPrice
  //         ? {
  //             usdTotalSupplied: {
  //               value:
  //                 acc.usdTotalSupplied.value +
  //                 (asset.stats.totalSupplied.value * asset.usdPrice.value) /
  //                   10n ** BigInt(asset.stats.totalSupplied.decimals),
  //               decimals: asset.usdPrice.decimals,
  //             },
  //             usdTotalBorrowed: {
  //               value:
  //                 acc.usdTotalBorrowed.value +
  //                 (asset.stats.totalDebt.value * asset.usdPrice.value) /
  //                   10n ** BigInt(asset.stats.totalDebt.decimals),
  //               decimals: asset.usdPrice.decimals,
  //             },
  //           }
  //         : acc;
  //     },
  //     {
  //       usdTotalSupplied: ZERO,
  //       usdTotalBorrowed: ZERO,
  //     }
  //   );
  // }

  private async getPoolAssetsPriceAndRiskMdx(
    poolId: IPool['id'],
    poolExtensionContractAddress: IPool['extensionContractAddress'],
    poolAssets: IPoolAsset[]
  ): Promise<IPoolAsset[]> {
    return await Promise.all(
      poolAssets.map(async (asset) => {
        const [usdPrice, riskMdx] = await Promise.all([
          this.getTokenPrice(asset, poolId, poolExtensionContractAddress),
          Promise.resolve(undefined),
        ]);

        return {
          ...asset,
          risk: null,
          usdPrice,
        };
      })
    );
  }

  public async getPool(poolId: string): Promise<IPool> {
    const data = await fetch(`${VESU_API_URL}/pools/${poolId}`).then((res) =>
      res.json()
    );
    const pool = z
      .object({ data: poolParser })
      .transform(({ data }) => data)
      .parse(data);
    const assets = await this.getPoolAssetsPriceAndRiskMdx(
      pool.id,
      pool.extensionContractAddress,
      pool.assets
    );

    // const stats = this.computePoolStats(assets);
    // console.log('333stats', stats);

    return { ...pool, assets };
  }
  async approveVTokenCalls(
    assetAddress: Address,
    vTokenAddress: Address,
    amount: bigint
  ): Promise<Call> {
    const tokenContract = getErc20Contract(assetAddress);

    const approveCall = tokenContract.populateTransaction.approve(
      vTokenAddress,
      amount
    );

    return approveCall;
  }

  async depositEarnTransaction(
    params: DepositParams,
    agent: StarknetAgentInterface
  ): Promise<DepositResult> {
    try {
      const account = new Account(
        this.agent.contractInteractor.provider,
        this.walletAddress,
        this.agent.getAccountCredentials().accountPrivateKey
      );
      const pool = await this.getPool(GENESIS_POOLID);

      const collateralPoolAsset = pool.assets.find(
        (a) =>
          a.symbol.toLocaleUpperCase() ===
          params.depositTokenSymbol.toLocaleUpperCase()
      );

      if (!collateralPoolAsset) {
        throw new Error('Collateral asset not found in pool');
      }
      console.log('params.depositAmount===', params.depositAmount);
      console.log(
        'collateralPoolAsset.decimals===',
        collateralPoolAsset.decimals
      );
      const collateralAmount = parseUnits(
        params.depositAmount,
        0
        // collateralPoolAsset.decimals
      );

      const vtokenContract = getVTokenContract(
        collateralPoolAsset.vToken.address
      );

      const vTokenApproveCall = await this.approveVTokenCalls(
        collateralPoolAsset.address,
        collateralPoolAsset.vToken.address,
        collateralAmount
      );
      console.log(
        'params:',
        collateralPoolAsset.address,
        collateralPoolAsset.vToken.address,
        collateralAmount
      );
      // console.log('vTokenApproveCall', vTokenApproveCall);

      const depositVTokenCall =
        await vtokenContract.populateTransaction.deposit(
          toU256(collateralAmount),
          account.address
        );
      console.log('depositVTokenCall', depositVTokenCall);

      // const calls = await processTransactionCalls([
      //   vTokenApproveCall,
      //   depositVTokenCall,
      // ]);

      const credentials = agent.getAccountCredentials();
      const provider = agent.getProvider();
      console.log('credentials', credentials);
      console.log('provider', provider);

      const wallet = new Account(
        provider,
        credentials.accountPublicKey,
        credentials.accountPrivateKey
      );
      console.log('wallet', wallet);
      const nonce = await provider.getNonceForAddress(account.address);
      console.log('nonce!!!', nonce);

      // const tx = await wallet.request({
      //   type: 'wallet_addInvokeTransaction',
      //   params: { calls },
      // });

      // const approval = await wallet.execute({
      //   contractAddress: vTokenApproveCall.contractAddress,
      //   entrypoint: vTokenApproveCall.entrypoint,
      //   calldata: vTokenApproveCall.calldata,
      // });
      // console.log('approval', approval);

      // const deposit = await wallet.execute({
      //   contractAddress: depositVTokenCall.contractAddress,
      //   entrypoint: depositVTokenCall.entrypoint,
      //   calldata: depositVTokenCall.calldata,
      // });
      const tx = await account.execute([
        {
          contractAddress: vTokenApproveCall.contractAddress,
          entrypoint: vTokenApproveCall.entrypoint,
          calldata: vTokenApproveCall.calldata,
        },
        {
          contractAddress: depositVTokenCall.contractAddress,
          entrypoint: depositVTokenCall.entrypoint,
          calldata: depositVTokenCall.calldata,
        },
      ]);

      console.log('approval initiated. Transaction hash:', tx.transaction_hash);
      // console.log(
      //   'deposit initiated. Transaction hash:',
      //   deposit.transaction_hash
      // );
      // await provider.waitForTransaction(approval.transaction_hash);
      await provider.waitForTransaction(tx.transaction_hash);

      const transferResult: DepositResult = {
        status: 'success',
        amount: params.depositAmount,
        symbol: params.depositTokenSymbol,
        recipients_address: account.address,
        transaction_hash: tx.transaction_hash,
      };

      return transferResult;
      // const txHash = hexSchema.parse(tx.transaction_hash);

      // return {
      //   status: 'success',
      //   message: `Successfully deposited ${params.depositAmount} ${params.depositTokenSymbol}`,
      //   transactionHash: deposit.transaction_hash,
      //   depositAmount: params.depositAmount,
      //   depositToken: params.depositTokenSymbol,
      //   // receipt,
      //   // events,
      // };
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

  // private async monitorSwapStatus(txHash: string) {
  //   const receipt = await this.agent.transactionMonitor.waitForTransaction(
  //     txHash,
  //     (status) => console.log('Swap status:', status)
  //   );

  //   const events =
  //     await this.agent.transactionMonitor.getTransactionEvents(txHash);
  //   return { receipt, events };
  // }
}

export const createDepositEarnService = (
  agent: StarknetAgentInterface,
  walletAddress?: string
): DepositEarnService => {
  if (!walletAddress) {
    throw new Error('Wallet address not configured');
  }

  return new DepositEarnService(agent, walletAddress);
};

export const depositEarnPosition = async (
  agent: StarknetAgentInterface,
  params: DepositParams
) => {
  const accountAddress = agent.getAccountCredentials()?.accountPublicKey;
  console.log('hello', accountAddress);
  try {
    const depositEarnService = createDepositEarnService(agent, accountAddress);
    const result = await depositEarnService.depositEarnTransaction(
      params,
      agent
    );
    return JSON.stringify(result);
  } catch (error) {
    console.error('Detailed deposit error:', error);
    if (error instanceof Error) {
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return JSON.stringify({
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
