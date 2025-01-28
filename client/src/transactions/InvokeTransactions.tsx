import { TransactionResponse } from '@/interfaces/starknetagents';
import { InvokeTransaction } from '@/types/starknetagents';

export const handleInvokeTransactions = (
  response: TransactionResponse
): InvokeTransaction[] => {
  //console.log('Response reçue:', JSON.stringify(response, null, 2));

  return response.results.map((item) => {
    console.log('Transaction traitée:', JSON.stringify(item.transactions));

    return {
      contractAddress: item.transactions.contractAddress,
      entrypoint: item.transactions.entrypoint,
      calldata: item.transactions.calldata,
    };
  });
};
