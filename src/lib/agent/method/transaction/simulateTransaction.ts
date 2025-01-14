import {
  Account,
  Call,
  TransactionType,
  SimulateTransactionResponse,
  BigNumberish,
  DeployAccountContractPayload,
} from 'starknet';
import { rpcProvider } from '../../starknetAgent';
import { colorLog } from '../../../../lib/utils/Output/console_log';
import {
  InvocationInvokePayload,
  Invocation_Deploy_Account,
  Invocation_Invoke,
  Invocation_Deploy_Account_Payload,
} from 'src/lib/utils/types/simulatetransaction';

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

    const index = 1;
    const invocations: Invocation_Invoke[] = params.calls.map((call, index) => {
      colorLog.info(`\n--- Call ${index + 1} ---`);
      colorLog.info(`Contract Address: ${call.contractAddress}`);
      colorLog.info(`Entrypoint: ${call.entrypoint}`);
      colorLog.info('Calldata:');

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
    const transactionDetails = simulate_transaction.map(
      (transaction, index) => {
        const feeData = transaction.fee_estimation;
        const resourceBounds = transaction.resourceBounds;

        return {
          transaction_number: index + 1,

          fee_estimation: {
            title: 'Fee Estimation Breakdown',
            details: {
              ...feeData,
            },
          },

          resource_bounds: {
            l1_gas: {
              max_amount: resourceBounds.l1_gas.max_amount,
              max_price_per_unit: resourceBounds.l1_gas.max_price_per_unit,
            },
            l2_gas: {
              max_amount: resourceBounds.l2_gas.max_amount,
              max_price_per_unit: resourceBounds.l2_gas.max_price_per_unit,
            },
          },

          suggested_max_fee: transaction.suggestedMaxFee.toString(),
        };
      }
    );
    console.log(JSON.stringify(transactionDetails, null, 2));
    return JSON.stringify(
      {
        status: 'success',
        transaction_details: transactionDetails,
      },
      null,
      2
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

    const index = 1;
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
    const transactionDetails = simulate_transaction.map(
      (transaction, index) => {
        const feeData = transaction.fee_estimation;
        const resourceBounds = transaction.resourceBounds;

        return {
          transaction_number: index + 1,

          fee_estimation: {
            title: 'Fee Estimation Breakdown',
            details: {
              ...feeData,
            },
          },

          resource_bounds: {
            l1_gas: {
              max_amount: resourceBounds.l1_gas.max_amount,
              max_price_per_unit: resourceBounds.l1_gas.max_price_per_unit,
            },
            l2_gas: {
              max_amount: resourceBounds.l2_gas.max_amount,
              max_price_per_unit: resourceBounds.l2_gas.max_price_per_unit,
            },
          },

          suggested_max_fee: transaction.suggestedMaxFee.toString(),
        };
      }
    );

    console.log(JSON.stringify(transactionDetails, null, 2));
    return JSON.stringify(
      {
        status: 'success',
        transaction_details: transactionDetails,
      },
      null,
      2
    );
  } catch (error) {
    return JSON.stringify({
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
