import { z } from 'zod';
import { StarknetAgentInterface } from 'src/lib/agent/tools/tools';
import { TokenService } from './fetchTokens';
import { Router as FibrousRouter, RouteResponse } from 'fibrous-router-sdk';
import { BigNumber } from '@ethersproject/bignumber';
import { SwapParams } from '../types';

export const routeSchema = z.object({
  sellTokenSymbol: z
    .string()
    .describe("Symbol of the token to sell (e.g., 'ETH', 'USDC')"),
  buyTokenSymbol: z
    .string()
    .describe("Symbol of the token to buy (e.g., 'ETH', 'USDC')"),
  sellAmount: z.number().positive().describe('Amount of tokens to sell'),
});

type RouteSchemaType = z.infer<typeof routeSchema>;

interface RouteResult {
  status: 'success' | 'failure';
  route?: RouteResponse | null;
  error?: string;
}

export class RouteFetchService {
  private tokenService: TokenService;
  private router: FibrousRouter;

  constructor() {
    this.tokenService = new TokenService();
    this.router = new FibrousRouter();
  }

  async initialize(): Promise<void> {
    await this.tokenService.initializeTokens();
  }

  async fetchRoute(params: RouteSchemaType): Promise<RouteResult> {
    try {
      await this.initialize();

      const { sellToken, buyToken } = this.tokenService.validateTokenPair(
        params.sellTokenSymbol,
        params.buyTokenSymbol
      );

      const formattedAmount = BigInt(params.sellAmount.toString());

      const route = await this.router.getBestRoute(
        BigNumber.from(formattedAmount.toString()),
        sellToken.address,
        buyToken.address,
        'starknet'
      );

      if (!route?.success) {
        return {
          status: 'failure',
          error: 'No routes available for this swap',
        };
      }

      if (!route) {
        return {
          status: 'failure',
          error: 'No valid route found in quote',
        };
      }

      return {
        status: 'success',
        route,
      };
    } catch (error) {
      console.error('Route fetching error:', error);
      return {
        status: 'failure',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export const getRoute = async (
  agent: StarknetAgentInterface,
  params: RouteSchemaType
): Promise<RouteResult> => {
  try {
    const tokenService = new TokenService();
    await tokenService.initializeTokens();
    const routeService = new RouteFetchService();
    return routeService.fetchRoute(params);
  } catch (error) {
    console.error('Route fetching error:', error);
    return {
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};


async function testFibrous() {
  const agent = {
      getAccountCredentials: () => ({
        accountPublicKey: process.env.ACCOUNT_PUBLIC_KEY,
        accountPrivateKey: process.env.ACCOUNT_PRIVATE_KEY,
      }),
      getProvider: () => process.env.PROVIDER_URL,
    } as unknown as StarknetAgentInterface;
    const params: SwapParams = {
      sellTokenSymbol: 'STRK',
      buyTokenSymbol: 'ETH',
      sellAmount: 1,
    };

    const result = await getRoute(agent, params);

console.log(result);
}

testFibrous();