import { rpcProvider } from 'src/lib/agent/starknetAgent';
import { Account, TransactionType } from 'starknet';
import {
  Invocation_Invoke,
  Invocation_Deploy_Account,
  SimulateDeployTransactionAccountParams,
  SimulateInvokeTransactionParams,
  SimulateDeployTransactionParams,
  Invocation_Deploy,
  SimulateDeclareTransactionAccountParams,
} from 'src/lib/utils/types/simulatetransaction';
import { TransactionReponseFormat } from 'src/lib/utils/Output/output_simulatetransaction';
import { DEFAULT_NONCE } from 'src/lib/utils/constants/contract';

export const simulateInvokeTransaction = async (
  params: SimulateInvokeTransactionParams,
  privateKey: string
) => {
  try {
    const accountAddress = process.env.PUBLIC_ADDRESS;
    if (!accountAddress) {
      throw new Error('Account address not configured');
    }

    const account = new Account(rpcProvider, accountAddress, privateKey);

    const invocations: Invocation_Invoke[] = params.payloads.map((payload) => {
      return {
        type: TransactionType.INVOKE,
        payload: {
          contractAddress: payload.contractAddress,
          entrypoint: payload.entrypoint,
          calldata: payload.calldata as string[],
        },
      };
    });

    const simulate_transaction = await account.simulateTransaction(invocations);

    const transaction_output = TransactionReponseFormat(simulate_transaction);

    return JSON.stringify({
      status: 'success',
      transaction_output: transaction_output,
    });
  } catch (error) {
    return JSON.stringify({
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const simulateDeployAccountTransaction = async (
  params: SimulateDeployTransactionAccountParams,
  privateKey: string
) => {
  try {
    const accountAddress = process.env.PUBLIC_ADDRESS;
    if (!accountAddress) {
      throw new Error('Account address not configured');
    }

    const account = new Account(rpcProvider, accountAddress, privateKey);

    const invocations: Invocation_Deploy_Account[] = params.payloads.map(
      (payload) => {
        return {
          type: TransactionType.DEPLOY_ACCOUNT,
          payload: {
            classHash: payload.classHash,
            constructorCalldata: payload.constructorCalldata ?? [],
            addressSalt: payload.addressSalt,
            contractAddress: payload.contractAddress,
          },
        };
      }
    );

    const simulate_transaction = await account.simulateTransaction(
      invocations,
      {
        nonce: DEFAULT_NONCE,
      }
    );
    const transaction_output = TransactionReponseFormat(simulate_transaction);

    return JSON.stringify({
      status: 'success',
      transaction_output: transaction_output,
    });
  } catch (error) {
    return JSON.stringify({
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const simulateDeployTransaction = async (
  params: SimulateDeployTransactionParams,
  privateKey: string
) => {
  try {
    const accountAddress = process.env.PUBLIC_ADDRESS;
    if (!accountAddress) {
      throw new Error('Account address not configured');
    }

    const account = new Account(rpcProvider, accountAddress, privateKey);

    const invocations: Invocation_Deploy[] = params.payloads.map((payload) => {
      return {
        type: TransactionType.DEPLOY,
        payload: {
          classHash: payload.classHash,
          salt: payload.salt,
          constructorCalldata: payload.constructorCalldata,
          unique: payload.unique,
        },
      };
    });

    const simulate_transaction = await account.simulateTransaction(invocations);

    const transaction_output = TransactionReponseFormat(simulate_transaction);

    return JSON.stringify({
      status: 'success',
      transaction_output: transaction_output,
    });
  } catch (error) {
    return JSON.stringify({
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const simulateDeclareTransaction = async (
  params: SimulateDeclareTransactionAccountParams,
  privateKey: string
) => {
  try {
    const accountAddress = process.env.PUBLIC_ADDRESS;
    if (!accountAddress) {
      throw new Error('Account address not configured');
    }

    const account = new Account(rpcProvider, accountAddress, privateKey);

    const invocations = [
      {
        type: TransactionType.DECLARE as const,
        payload: {
          contract: params.contract,
          classHash: params.classHash,
          casm: params.casm,
          compiledClassHash: params.compiledClassHash,
        },
      },
    ];

    const simulate_transaction = await account.simulateTransaction(invocations);
    const transaction_output = TransactionReponseFormat(simulate_transaction);

    return JSON.stringify({
      status: 'success',
      transaction_output: transaction_output,
    });
  } catch (error) {
    return JSON.stringify({
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
