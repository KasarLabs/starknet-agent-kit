import { Account } from 'starknet';
import { 
  executeCancelOrder,
  executeCreateOrder,
  fetchGetOrders,
  CreateOrderDto,
  PricingStrategy
} from '@avnu/avnu-sdk';
import { TokenService } from './tokenService';
import { ApprovalService } from './approvalService';
import { StarknetAgent } from 'src/lib/agent/starknetAgent';
import * as moment from 'moment';

export class DcaService {
  private tokenService: TokenService;
  private approvalService: ApprovalService;

  constructor(
    private agent: StarknetAgent,
    private walletAddress: string,
    private privateKey: string
  ) {
    this.tokenService = new TokenService();
    this.approvalService = new ApprovalService(agent);
  }

  async initialize(): Promise<void> {
    await this.tokenService.initializeTokens();
  }

  private parseDuration(isoDuration: string): moment.Duration {
    return moment.duration(isoDuration);
  }

  async createDcaOrder(params: {
    sellTokenSymbol: string;
    buyTokenSymbol: string;
    sellAmount: string;
    sellAmountPerCycle: string;
    frequency: string;
    pricingStrategy?: PricingStrategy;
  }) {
    try {
      await this.initialize();

      const { sellToken, buyToken } = this.tokenService.validateTokenPair(
        params.sellTokenSymbol,
        params.buyTokenSymbol
      );

      const account = new Account(
        this.agent.contractInteractor.provider,
        this.walletAddress,
        this.privateKey
      );

      const defaultPricingStrategy: PricingStrategy = {};

      // Prepare order parameters
      const orderDto: CreateOrderDto = {
        traderAddress: this.walletAddress,
        sellTokenAddress: sellToken.address,
        buyTokenAddress: buyToken.address,
        sellAmount: params.sellAmount,
        sellAmountPerCycle: params.sellAmountPerCycle,
        frequency: this.parseDuration(params.frequency),
        pricingStrategy: params.pricingStrategy || defaultPricingStrategy
      };

      // Create DCA order using Avnu SDK
      const result = await executeCreateOrder(account, orderDto, {
        gasless: false
      });

      const { receipt, events } = await this.monitorDcaStatus(
        result.transactionHash
      );

      return {
        status: 'success',
        message: `Successfully created DCA order to swap ${params.sellTokenSymbol} for ${params.buyTokenSymbol}`,
        transactionHash: result.transactionHash,
        receipt,
        events
      };
    } catch (error) {
      console.error('DCA order creation error:', error);
      return {
        status: 'failure',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getDcaOrders() {
    try {
      const orders = await fetchGetOrders({
        traderAddress: this.walletAddress
      });

      return {
        status: 'success',
        orders: orders.content
      };
    } catch (error) {
      console.error('Error fetching DCA orders:', error);
      return {
        status: 'failure',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async cancelDcaOrder(params: { orderAddress: string }) {
    try {
      const account = new Account(
        this.agent.contractInteractor.provider,
        this.walletAddress,
        this.privateKey
      );

      const result = await executeCancelOrder(account, params.orderAddress, {
        gasless: false
      });

      const { receipt, events } = await this.monitorDcaStatus(
        result.transactionHash
      );

      return {
        status: 'success',
        message: 'Successfully cancelled DCA order',
        transactionHash: result.transactionHash,
        receipt,
        events
      };
    } catch (error) {
      console.error('Error cancelling DCA order:', error);
      return {
        status: 'failure',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async monitorDcaStatus(txHash: string) {
    const receipt = await this.agent.transactionMonitor.waitForTransaction(
      txHash,
      (status) => console.log('DCA transaction status:', status)
    );

    const events = await this.agent.transactionMonitor.getTransactionEvents(txHash);
    return { receipt, events };
  }
}

// Helper factory function
export const createDcaService = (
  privateKey: string,
  walletAddress?: string
): DcaService => {
  if (!walletAddress) {
    throw new Error('Wallet address not configured');
  }

  const agent = new StarknetAgent({
    walletPrivateKey: process.env.PRIVATE_KEY,
    aiProviderApiKey: process.env.AI_PROVIDER_API_KEY,
    aiModel: process.env.AI_MODEL,
    aiProvider: process.env.AI_PROVIDER,
  });

  return new DcaService(agent, walletAddress, privateKey);
};

// Wrapper functions for direct use
export const createDcaOrder = async (
  params: {
    sellTokenSymbol: string;
    buyTokenSymbol: string;
    sellAmount: string;
    sellAmountPerCycle: string;
    frequency: string;
    pricingStrategy?: PricingStrategy;
  },
  privateKey: string
): Promise<string> => {
  const dcaService = createDcaService(privateKey, process.env.PUBLIC_ADDRESS);
  const result = await dcaService.createDcaOrder(params);
  return JSON.stringify(result);
};

export const getDcaOrders = async (
  privateKey: string
): Promise<string> => {
  const dcaService = createDcaService(privateKey, process.env.PUBLIC_ADDRESS);
  const result = await dcaService.getDcaOrders();
  return JSON.stringify(result);
};

export const cancelDcaOrder = async (
  params: { orderAddress: string },
  privateKey: string
): Promise<string> => {
  const dcaService = createDcaService(privateKey, process.env.PUBLIC_ADDRESS);
  const result = await dcaService.cancelDcaOrder(params);
  return JSON.stringify(result);
};