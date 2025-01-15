import { rpcProvider } from 'src/lib/agent/starknetAgent';
import { colorLog } from 'src/lib/utils/Output/console_log';
import { Account, DeployAccountContractPayload } from 'starknet';

import { EstimateAccountDeployFeeParams } from 'src/lib/utils/types/estimate';

export const estimateAccountDeployFee = async (
  params: EstimateAccountDeployFeeParams,
  privateKey: string
) => {
  try {
    const accountAddress = process.env.PUBLIC_ADDRESS;
    if (!accountAddress) {
      throw new Error('Account address not configured');
    }

    const account = new Account(rpcProvider, accountAddress, privateKey);

    let index = 1;
    const invocations: DeployAccountContractPayload[] = params.payloads.map(
      (payload) => {
        if (Array.isArray(payload.constructorCalldata)) {
          payload.constructorCalldata.forEach((data, dataIndex) => {
            console.log(`  Param ${dataIndex + 1}:`, data);
          });
        }

        return {
          classHash: payload.classHash,
          constructorCalldata: payload.constructorCalldata ?? [],
          addressSalt: payload.addressSalt,
          contractAddress: payload.contractAddress,
        };
      }
    );

    const estimatedFee = await account.estimateAccountDeployFee(invocations[0]);
    colorLog.success('Simulation is succesfull !');
    colorLog.info(estimatedFee.suggestedMaxFee.toString());
    colorLog.info(estimatedFee.overall_fee.toString());
    colorLog.info(estimatedFee.gas_price.toString());
    colorLog.info(estimatedFee.gas_consumed.toString());
    return JSON.stringify({
      status: 'success',
      maxFee: estimatedFee.suggestedMaxFee.toString(),
      overallFee: estimatedFee.overall_fee.toString(),
      gasPrice: estimatedFee.gas_price.toString(),
      gasUsage: estimatedFee.gas_consumed.toString(),
      unit: 'wei',
      resourceBounds: {
        l1_gas: {
          maxAmount: estimatedFee.resourceBounds.l1_gas.max_amount.toString(),
          maxPricePerUnit:
            estimatedFee.resourceBounds.l1_gas.max_price_per_unit.toString(),
        },
        l2_gas: {
          maxAmount: estimatedFee.resourceBounds.l2_gas.max_amount.toString(),
          maxPricePerUnit:
            estimatedFee.resourceBounds.l2_gas.max_price_per_unit.toString(),
        },
      },
    });
  } catch (error) {
    return JSON.stringify({
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
