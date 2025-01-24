import { tool } from '@langchain/core/tools';
import { transfer_call_data_schema } from '../schema';
import { transfer_call_data } from '../method/token/transfer';
import { create_deploy_argent_account } from '../method/account/deployAccount';

export const RegistercalldataTools = () => [
  tool(transfer_call_data, {
    name: 'transfer_call_data',
    description: 'return transfer call data schema',
    schema: transfer_call_data_schema,
  }),
  tool(create_deploy_argent_account, {
    name: 'create_deploy_argent_account',
    description: 'return create_deploy_argent_account call data schema',
  }),
];
