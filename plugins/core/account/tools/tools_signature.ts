import { StarknetSignatureToolRegistry } from 'agent/lib/agent/tools/signatureTools';
import {
  CreateArgentAccountSignature,
  CreateOZAccountSignature,
} from '../actions/createAccount';
import {
  DeployArgentAccountSignature,
  DeployOZAccountSignature,
} from '../actions/deployAccount';
import { DeployArgentAccountSchema, DeployOZAccountSchema } from '../schema';

export const registerSignatureToolsAccount = () => {
  StarknetSignatureToolRegistry.RegisterSignatureTools({
    name: 'create_argent_account',
    description:
      'create argent account return the privateKey/publicKey/contractAddress',
    execute: CreateArgentAccountSignature,
  }),
    StarknetSignatureToolRegistry.RegisterSignatureTools({
      name: 'create_open_zeppelin_account',
      description:
        'create open_zeppelin/OZ account return the privateKey/publicKey/contractAddress',
      execute: CreateOZAccountSignature,
    }),
    StarknetSignatureToolRegistry.RegisterSignatureTools({
      name: 'deploy_argent_account',
      description:
        'deploy argent account return the deploy transaction address',
      schema: DeployArgentAccountSchema,
      execute: DeployArgentAccountSignature,
    }),
    StarknetSignatureToolRegistry.RegisterSignatureTools({
      name: 'deploy_open_zeppelin_account',
      description:
        'deploy open_zeppelin account return the deploy transaction address',
      schema: DeployOZAccountSchema,
      execute: DeployOZAccountSignature,
    });
};
