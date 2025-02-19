import { StarknetSignatureToolRegistry } from 'src/lib/agent/tools/signatureTools';

import { 
  transferFromSignatureSchema,
  approveSignatureSchema,
  transferSignatureSchema,
} from '../../../erc20/schemas/schema';

import { transfer_signature } from '../../../erc20/actions/transfer';
import { approve_signature } from '../../../erc20/actions/approve';
import { transfer_from_signature } from '../../../erc20/actions/transferFrom';


export const registerSignatureToolsToken = () => {
  // Register transferFrom signature tool
  StarknetSignatureToolRegistry.RegisterSignatureTools({
    name: 'transfer_from',
    description: 'Generate batch transfer from transactions',
    schema: transferFromSignatureSchema,
    execute: transfer_from_signature,
  });

  // Register approve signature tool
  StarknetSignatureToolRegistry.RegisterSignatureTools({
    name: 'approve',
    description: 'Generate batch approve transactions',
    schema: approveSignatureSchema,
    execute: approve_signature,
  });

  // Register transfer signature tool
  StarknetSignatureToolRegistry.RegisterSignatureTools({
    name: 'transfer',
    description: 'Generate batch transfer transactions',
    schema: transferSignatureSchema,
    execute: transfer_signature,
  });

  // // Register getBalance signature tool
  // StarknetSignatureToolRegistry.RegisterSignatureTools({
  //   name: 'get_balance',
  //   description: 'Get token balance for an account address with signature verification',
  //   schema: getBalanceSignatureSchema,
  //   execute: getBalanceSignature,
  // });
};