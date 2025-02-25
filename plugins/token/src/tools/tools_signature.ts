import { SignatureTool } from '@starknet-agent-kit/agents';
import { transfer_signature } from '../actions/transfer';
import { getBalanceSignature } from '../actions/getBalances';
import { getBalanceSchema, transferSignatureschema } from '../schema';

export const registerSignatureTools = (tools: SignatureTool[]) => {
  tools.push({
    name: 'transfer',
    description: 'return transfer json transaction',
    schema: transferSignatureschema,
    execute: transfer_signature,
  }),
    tools.push({
      name: 'getbalance',
      description: 'return the amoumt of token at a account address',
      schema: getBalanceSchema,
      execute: getBalanceSignature,
    });
};
