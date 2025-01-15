import { rpcProvider } from 'src/lib/agent/starknetAgent';
import { Account, Call, TransactionType } from 'starknet';
import {
  Invocation_Invoke,
  Invocation_Deploy_Account,
  simulateDeployTransactionAccountParams,
  simulateInvokeTransactionParams,
  simulateDeployTransactionParams,
  Invocation_Deploy,
  simulateDeclareTransactionAccountParams,
} from 'src/lib/utils/types/simulatetransaction';
import { TransactionReponseFormat } from 'src/lib/utils/Output/output_simulatetransaction';
import { colorLog } from 'src/lib/utils/Output/console_log';

export const simulateInvokeTransaction = async (
  params: simulateInvokeTransactionParams,
  privateKey: string
) => {
  try {
    const accountAddress = process.env.PUBLIC_ADDRESS;
    if (!accountAddress) {
      throw new Error('Account address not configured');
    }
    1;
    const account = new Account(rpcProvider, accountAddress, privateKey);

    let index = 1;
    const invocations: Invocation_Invoke[] = params.payloads.map(
      (payload, index) => {
        if (Array.isArray(payload.calldata)) {
          payload.calldata.forEach((data: any, dataIndex: number) => {
            colorLog.info(`  Param ${dataIndex + 1}: ${data}`);
          });
        }

        return {
          type: TransactionType.INVOKE,
          payload: {
            contractAddress: payload.contractAddress,
            entrypoint: payload.entrypoint,
            calldata: payload.calldata as string[],
          },
        };
      }
    );

    const simulate_transaction = await account.simulateTransaction(invocations);

    colorLog.success('Simulation is succesfull !');
    colorLog.info('Simulation response:');
    const transaction_output = TransactionReponseFormat(simulate_transaction);

    colorLog.info(JSON.stringify(transaction_output, null, 2));
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
  params: simulateDeployTransactionAccountParams,
  privateKey: string
) => {
  try {
    const accountAddress = process.env.PUBLIC_ADDRESS;
    if (!accountAddress) {
      throw new Error('Account address not configured');
    }

    const account = new Account(rpcProvider, accountAddress, privateKey);

    let index = 1;
    const invocations: Invocation_Deploy_Account[] = params.payloads.map(
      (payload, index) => {
        if (Array.isArray(payload.constructorCalldata)) {
          payload.constructorCalldata.forEach((data, dataIndex) => {
            console.log(`  Param ${dataIndex + 1}:`, data);
          });
        }

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
        nonce: '0x0',
      }
    );

    colorLog.success('Simulation is succesfull !');

    colorLog.info('Simulation response:');
    const transaction_output = TransactionReponseFormat(simulate_transaction);

    colorLog.info(JSON.stringify(transaction_output, null, 2));
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
  params: simulateDeployTransactionParams,
  privateKey: string
) => {
  try {
    const accountAddress = process.env.PUBLIC_ADDRESS;
    if (!accountAddress) {
      throw new Error('Account address not configured');
    }

    const account = new Account(rpcProvider, accountAddress, privateKey);

    let index = 1;
    const invocations: Invocation_Deploy[] = params.payloads.map(
      (payload, index) => {
        if (Array.isArray(payload.constructorCalldata)) {
          payload.constructorCalldata.forEach((data, dataIndex) => {
            console.log(`  Param ${dataIndex + 1}:`, data);
          });
        }

        return {
          type: TransactionType.DEPLOY,
          payload: {
            classHash: payload.classHash,
            salt: payload.salt,
            constructorCalldata: payload.constructorCalldata,
            unique: payload.unique,
          },
        };
      }
    );

    const simulate_transaction = await account.simulateTransaction(invocations);

    colorLog.success('Simulation is succesfull !');

    colorLog.info('Simulation response:');
    const transaction_output = TransactionReponseFormat(simulate_transaction);

    colorLog.info(JSON.stringify(transaction_output, null, 2));
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
  params: simulateDeclareTransactionAccountParams,
  privateKey: string
) => {
  try {
    const accountAddress = process.env.PUBLIC_ADDRESS;
    if (!accountAddress) {
      throw new Error('Account address not configured');
    }

    const account = new Account(rpcProvider, accountAddress, privateKey);
    console.log('\nAccount created with address:', accountAddress);

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

    console.log('\nPrepared invocations:');
    console.log('\nStarting simulation...');

    const simulate_transaction = await account.simulateTransaction(invocations);
    colorLog.success('\nSimulation completed successfully');
    const transaction_output = TransactionReponseFormat(simulate_transaction);

    colorLog.info(JSON.stringify(transaction_output, null, 2));
    return JSON.stringify({
      status: 'success',
      transaction_output: transaction_output,
    });
  } catch (error) {
    console.error('\nError occurred during simulation:');
    console.error(error);
    throw error;
  }
};
