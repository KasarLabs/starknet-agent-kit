import { LaunchOnEkuboParams } from 'src/lib/agent/schema';
import { rpcProvider } from 'src/lib/agent/starknetAgent';
import { FACTORY_ADDRESS } from 'src/lib/utils/unruggable';
import { factoryAbi } from 'src/lib/utils/unruggable/abi';
import { Contract } from 'starknet';

/**
 * Launches a memecoin on Ekubo DEX
 */
export const launchOnEkubo = async ({
  launchParams,
  ekuboParams,
}: LaunchOnEkuboParams) => {
  try {
    const contract = new Contract(factoryAbi, FACTORY_ADDRESS, rpcProvider);

    const params = {
      memecoin_address: launchParams.memecoinAddress,
      transfer_restriction_delay: launchParams.transferRestrictionDelay,
      max_percentage_buy_launch: launchParams.maxPercentageBuyLaunch,
      quote_address: launchParams.quoteAddress,
      initial_holders: launchParams.initialHolders,
      initial_holders_amounts: launchParams.initialHoldersAmounts,
    };

    const ekuboPoolParams = {
      fee: ekuboParams.fee,
      tick_spacing: ekuboParams.tickSpacing,
      starting_price: {
        mag: ekuboParams.startingPrice.mag,
        sign: ekuboParams.startingPrice.sign,
      },
      bound: ekuboParams.bound,
    };

    const response = await contract.launch_on_ekubo(params, ekuboPoolParams);

    return JSON.stringify({
      status: 'success',
      response,
    });
  } catch (error) {
    console.error('Error launching on Ekubo:', error);
    return JSON.stringify({
      status: 'failed',
      error: error.message,
    });
  }
};
