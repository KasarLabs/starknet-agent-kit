import { TransactionReceipt } from 'starknet';

export interface SwapResult {
  status: 'success' | 'failure';
  message?: string;
  transactionHash?: string;
  sellAmount?: number;
  sellToken?: string;
  buyToken?: string;
  amountReceived?: string;
  receipt?: TransactionReceipt;
  events?: Event[];
  error?: string;
  step?: string;
}

export interface SwapQuote {
  sellTokenAddress: string;
  buyTokenAddress: string;
  sellAmount: string;
  buyAmount: string;
  guaranteedBuyAmount: string;
  fee: string;
  sourceAddress: string;
  priceImpact: string;
}

export interface SwapOptions {
  slippage: number;
  deadline?: number;
  referrer?: string;
}
