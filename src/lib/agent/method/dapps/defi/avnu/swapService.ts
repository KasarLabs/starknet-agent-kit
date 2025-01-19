import {
  executeSwap,
  fetchQuotes,
  QuoteRequest,
  Quote,
  Route,
} from '@avnu/avnu-sdk';
import { Account, RpcProvider } from 'starknet';
import { SwapParams, SwapResult } from 'src/lib/utils/types/swap';
import {
  SLIPPAGE_PERCENTAGE,
  DEFAULT_QUOTE_SIZE,
} from 'src/lib/utils/constants/swap';
import { TokenService } from './tokenService';
import { ApprovalService } from './approvalService';
import { StarknetAgentInterface } from 'src/lib/agent/tools';

export class SwapService {
  private tokenService: TokenService;
  private approvalService: ApprovalService;

  constructor(
    private agent: StarknetAgentInterface,
    private walletAddress: string
  ) {
    this.tokenService = new TokenService();
    this.approvalService = new ApprovalService(agent);
  }

  async initialize(): Promise<void> {
    await this.tokenService.initializeTokens();
  }

  private safeStringify(obj: unknown): string {
    return JSON.stringify(
      obj,
      (key, value) => (typeof value === 'bigint' ? value.toString() : value),
      2
    );
  }

  private extractSpenderAddress(quote: Quote): string | undefined {
    if (quote.routes?.length > 0) {
      const mainRoute = quote.routes[0];
      return mainRoute.address;
    }

    return undefined;
  }

  async executeSwapTransaction(
    params: SwapParams,
    agent: StarknetAgentInterface
  ): Promise<SwapResult> {
    try {
      await this.initialize();

      const account = new Account(
        this.agent.contractInteractor.provider,
        this.walletAddress,
        this.agent.getAccountCredentials().accountPrivateKey
      );

      const { sellToken, buyToken } = this.tokenService.validateTokenPair(
        params.sellTokenSymbol,
        params.buyTokenSymbol
      );

      const formattedAmount = BigInt(
        this.agent.contractInteractor.formatTokenAmount(
          params.sellAmount.toString(),
          sellToken.decimals
        )
      );

      const quoteParams: QuoteRequest = {
        sellTokenAddress: sellToken.address,
        buyTokenAddress: buyToken.address,
        sellAmount: formattedAmount,
        takerAddress: account.address,
        size: DEFAULT_QUOTE_SIZE,
      };

      const quotes = await fetchQuotes(quoteParams);
      if (!quotes?.length) {
        throw new Error('No quotes available for this swap');
      }

      const quote = quotes[0];

      // Log route information
      if (quote.routes?.length > 0) {
        console.log('Route information:', {
          name: quote.routes[0].name,
          address: quote.routes[0].address,
          routeInfo: this.safeStringify(quote.routes[0].routeInfo),
        });
      }

      const spenderAddress = this.extractSpenderAddress(quote);

      if (!spenderAddress) {
        throw new Error(
          `Could not determine spender address from quote. Available properties: ${Object.keys(quote).join(', ')}`
        );
      }

      await this.approvalService.checkAndApproveToken(
        account,
        sellToken.address,
        spenderAddress,
        formattedAmount.toString()
      );

      const swapResult = await executeSwap(account, quote, {
        slippage: SLIPPAGE_PERCENTAGE,
      });

      const { receipt, events } = await this.monitorSwapStatus(
        swapResult.transactionHash
      );

      return {
        status: 'success',
        message: `Successfully swapped ${params.sellAmount} ${params.sellTokenSymbol} for ${params.buyTokenSymbol}`,
        transactionHash: swapResult.transactionHash,
        sellAmount: params.sellAmount,
        sellToken: params.sellTokenSymbol,
        buyToken: params.buyTokenSymbol,
        receipt,
        events,
      };
    } catch (error) {
      console.error('Detailed swap error:', error);
      if (error instanceof Error) {
        console.error('Error type:', error.constructor.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      return {
        status: 'failure',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async monitorSwapStatus(txHash: string) {
    const receipt = await this.agent.transactionMonitor.waitForTransaction(
      txHash,
      (status) => console.log('Swap status:', status)
    );

    const events =
      await this.agent.transactionMonitor.getTransactionEvents(txHash);
    return { receipt, events };
  }
}

export const createSwapService = (
  agent: StarknetAgentInterface,
  walletAddress?: string
): SwapService => {
  if (!walletAddress) {
    throw new Error('Wallet address not configured');
  }

  return new SwapService(agent, walletAddress);
};

export const swapTokens = async (
  agent: StarknetAgentInterface,
  params: SwapParams
) => {
  try {
    const swapService = createSwapService(agent, process.env.PUBLIC_ADDRESS);
    const result = await swapService.executeSwapTransaction(params, agent);
    return JSON.stringify(result);
  } catch (error) {
    console.error('Detailed swap error:', error);
    if (error instanceof Error) {
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return JSON.stringify({
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
