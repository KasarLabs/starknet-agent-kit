export interface TransactionResult {
  status: 'success' | 'failure';
  tokenId?: string;
  from?: string;
  to?: string;
  operator?: string;
  approved?: boolean;
  transactionHash?: string;
  error?: string;
  step?: string;
}