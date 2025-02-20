import { StarknetSignatureToolRegistry } from 'src/lib/agent/tools/signatureTools';

import {
  transferFromSignatureSchema,
  approveSignatureSchema,
  transferSignatureSchema,
} from '../../../erc20/schemas/schema';

import { transferSignature } from '../../../erc20/actions/transfer';
import { approveSignature } from '../../../erc20/actions/approve';
import { transferFromSignature } from '../../../erc20/actions/transferFrom';

export const registerSignatureToolsToken = () => {
  StarknetSignatureToolRegistry.RegisterSignatureTools({
    name: 'transfer_from',
    description: 'Return transfer_from json transaction',
    schema: transferFromSignatureSchema,
    execute: transferFromSignature,
  });

  StarknetSignatureToolRegistry.RegisterSignatureTools({
    name: 'approve',
    description: 'Return approve json transaction',
    schema: approveSignatureSchema,
    execute: approveSignature,
  });

  StarknetSignatureToolRegistry.RegisterSignatureTools({
    name: 'transfer',
    description: 'Return transfer json transaction',
    schema: transferSignatureSchema,
    execute: transferSignature,
  });
};
