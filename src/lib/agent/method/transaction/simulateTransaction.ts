import { Account, Call, TransactionType, DeployAccountContractPayload, UniversalDeployerContractPayload, CompiledContract, CairoAssembly} from 'starknet';
import { rpcProvider } from '../../starknetAgent';
import { colorLog } from 'src/lib/utils/Output/console_log';
import { Invocation_Deploy_Account, Invocation_Invoke, Invocation_Deploy} from 'src/lib/utils/types/simulatetransaction';
import { TransactionReponseFormat } from 'src/lib/utils/Output/output_simulatetransaction';

export type simulateInvokeTransactionParams = {
  accountAddress: string;
  calls: Call[];
};

export const simulateInvokeTransaction = async (
  params: simulateInvokeTransactionParams,
  privateKey: string
) => {
  try {
    const accountAddress = process.env.PUBLIC_ADDRESS;
    if (!accountAddress) {
      throw new Error('Account address not configured');
    }

    const account = new Account(rpcProvider, accountAddress, privateKey);

    let index = 1;
    const invocations: Invocation_Invoke[] = params.calls.map((call, index) => {
      // colorLog.info(`\n--- Call ${index + 1} ---`);
      // colorLog.info(`Contract Address: ${call.contractAddress}`);
      // colorLog.info(`Entrypoint: ${call.entrypoint}`);
      // colorLog.info('Calldata:');

      if (Array.isArray(call.calldata)) {
        call.calldata.forEach((data: any, dataIndex: number) => {
          colorLog.info(`  Param ${dataIndex + 1}: ${data}`);
        });
      }

      return {
        type: TransactionType.INVOKE,
        payload: {
          contractAddress: call.contractAddress,
          entrypoint: call.entrypoint,
          calldata: call.calldata as string[],
        },
      };
    });

    const simulate_transaction = await account.simulateTransaction(invocations);

    colorLog.success('Simulation is succesfull !');
    colorLog.info('Simulation response:');
    const transaction_output = TransactionReponseFormat(simulate_transaction);

    colorLog.info(JSON.stringify(transaction_output, null, 2));
    return JSON.stringify(
      {
        status: 'success',
        transaction_output: transaction_output,
      },
    );
  } catch (error) {
    return JSON.stringify({
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export type simulateDeployTransactionAccountParams = {
  accountAddress: string;
  payloads: DeployAccountContractPayload[];
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
    return JSON.stringify(
      {
        status: 'success',
        transaction_output: transaction_output,
      }
    );
  } catch (error) {
    return JSON.stringify({
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export type simulateDeployTransactionParams = {
  accountAddress: string;
  payloads: UniversalDeployerContractPayload[];
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
    return JSON.stringify(
      {
        status: 'success',
        transaction_output: transaction_output,
      }
    );
  } catch (error) {
    return JSON.stringify({
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

type DeclareParams = {
  accountAddress: string;
  contract: string | CompiledContract;
  classHash?: string;
  casm?: CairoAssembly;
  compiledClassHash?: string;
};

export const simulateDeclareTransaction = async (
  params: DeclareParams,
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