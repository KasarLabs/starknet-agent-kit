import { StarknetAgentInterface } from 'src/lib/agent/tools/tools';
import { Account, constants, Contract } from 'starknet';
import { artpeaceAbi } from '../abis/artpeaceAbi';
import { artpeaceAddr } from '../constants/artpeace';
import { ArtpeaceHelper } from '../utils/helper';
import { placePixelParam } from 'src/lib/agent/schemas/schema';

/**
 * Places pixels on a Starknet canvas using the Artpeace contract
 * @param agent Interface for interacting with Starknet blockchain
 * @param input Object containing array of pixel parameters
 * @returns JSON string with transaction status and hash(es)
 */
export const placePixel = async (
  agent: StarknetAgentInterface,
  input: { params: placePixelParam[] }
) => {
  try {
    const { params } = input;
    const credentials = agent.getAccountCredentials();
    const provider = agent.getProvider();
    const account = new Account(
      provider,
      credentials.accountPublicKey,
      credentials.accountPrivateKey,
      undefined,
      constants.TRANSACTION_VERSION.V3
    );
    const artpeaceContract = new Contract(artpeaceAbi, artpeaceAddr, provider);

    const txHash = [];
    for (const param of params) {
      const { id, position, color } =
        await ArtpeaceHelper.validateAndFillDefaults(param);
      const timestamp = Math.floor(Date.now() / 1000);

      artpeaceContract.connect(account);
      const call = artpeaceContract.populate('place_pixel', {
        canvas_id: id,
        pos: position,
        color: color,
        now: timestamp,
      });

      const res = await account.execute(call);
      await provider.waitForTransaction(res.transaction_hash);
      txHash.push(res.transaction_hash);
    }

    return JSON.stringify({
      status: 'success',
      transaction_hash: txHash,
    });
  } catch (error) {
    return JSON.stringify({
      status: 'error',
      error: {
        code: 'PLACE_PIXEL_DATA_ERROR',
        message: error.message || 'Failed to place a pixel',
      },
    });
  }
};

/**
 * Generates the transaction signature data for placing pixels on Artpeace contract
 * @param input Object containing array of pixel parameters
 * @returns JSON string with transaction data or error response
 */
export const placePixelSignature = async (input: {
  params: placePixelParam[];
}) => {
  try {
    const { params } = input;
    const artpeaceContract = new Contract(artpeaceAbi, artpeaceAddr);

    const callData = [];
    for (const param of params) {
      const { id, position, color } =
        await ArtpeaceHelper.validateAndFillDefaults(param);
      const timestamp = Math.floor(Date.now() / 1000);

      const call = artpeaceContract.populate('place_pixel', {
        canvas_id: id,
        pos: position,
        color: color,
        now: timestamp,
      });

      callData.push({
        status: 'success',
        transactions: {
          ...call,
        },
      });
    }
    return JSON.stringify({ transaction_type: 'INVOKE', callData });
  } catch (error) {
    return {
      status: 'error',
      error: {
        code: 'PLACE_PIXEL_CALL_DATA_ERROR',
        message: error.message || 'Failed to generate place_pixel call data',
      },
    };
  }
};
