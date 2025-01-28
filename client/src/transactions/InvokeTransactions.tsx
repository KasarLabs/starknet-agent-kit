import { TransactionResponse } from '@/interfaces/starknetagents';
import { InvokeTransaction } from '@/types/starknetagents';

export const handleInvokeTransactions = (
  response: TransactionResponse
): InvokeTransaction[] => {
  return response.results.map((item) => {
    console.log('Transaction processed:', JSON.stringify(item.transactions));

    return {
      contractAddress: item.transactions.contractAddress,
      entrypoint: item.transactions.entrypoint,
      calldata: item.transactions.calldata,
    };
  });
};
