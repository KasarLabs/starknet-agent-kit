import { StarknetAgentInterface } from '../../tools/tools';
import {
  DexScrennerLatestBoostedTokensResponse,
  DexScrennerTokensReponse,
  LinksJson,
} from './types/dexscreener_types';

export const getLatestBoostedTokensProfile = async (
  agent: StarknetAgentInterface
) => {
  try {
    const result: DexScrennerTokensReponse[] = [];
    const response = await fetch(
      'https://api.dexscreener.com/token-profiles/latest/v1',
      {
        method: 'GET',
        headers: {},
      }
    );
    const data =
      (await response.json()) as DexScrennerLatestBoostedTokensResponse[];

    data.forEach((token) => {
      const token_response: DexScrennerTokensReponse = {
        url: token.url,
        chainId: token.chainId,
        tokenAddress: token.tokenAddress,
      };
      result.push(token_response);
    });

    result.forEach((token) => {
      console.log(token);
    });
    return {
      status: 'success',
      last_boosted_tokens: result,
    };
  } catch (error) {
    console.log(error);
    return {
      status: 'failure',
      error: error,
    };
  }
};
