import { CreateMemecoinParams } from 'src/lib/agent/schema';
import { stark, uint256 } from 'starknet';
import { rpcProvider } from 'src/lib/agent/starknetAgent';
import { Entrypoint, DECIMALS } from 'src/lib/utils/unruggable';
import { execute, decimalsScale } from 'src/lib/utils/unruggable/helper';

export const createMemecoin = async (
  params: CreateMemecoinParams,
  privateKey: string
) => {
  try {
    const salt = stark.randomAddress();
    const { transaction_hash } = await execute(
      Entrypoint.CREATE_MEMECOIN,
      process.env.PUBLIC_ADDRESS,
      privateKey,
      [
        params.owner,
        params.name,
        params.symbol,
        uint256.bnToUint256(
          BigInt(params.initialSupply) * BigInt(decimalsScale(DECIMALS))
        ),
        salt,
      ]
    );

    await rpcProvider.waitForTransaction(transaction_hash);

    return JSON.stringify({
      status: 'success',
      transactionHash: transaction_hash,
    });
  } catch (error) {
    console.error('Error creating memecoin:', error);
    return {
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};
