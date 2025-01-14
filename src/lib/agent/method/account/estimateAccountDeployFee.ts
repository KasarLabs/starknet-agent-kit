import { Account, EstimateFee, constants } from 'starknet';
import { rpcProvider } from 'src/lib/agent/starknetAgent';

export type EstimateAccountDeployFeeParams = {
  classHash: string;
  constructorCalldata?: string[];
  addressSalt?: string;
};

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

    // Estimate fee for deployment
    const estimatedFee = await account.estimateAccountDeployFee({
      classHash: params.classHash,
      constructorCalldata: params.constructorCalldata || [],
      addressSalt: params.addressSalt || '0x0',
      contractAddress: constants.ZERO.toString(),
    });

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
