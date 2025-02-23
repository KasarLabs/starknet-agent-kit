import { StarknetSignatureToolRegistry } from 'agents/agent/tools/signatureTools';
import { accountDetailsSchema } from '../schema/index';

import { CreateArgentAccountSignature } from '../../../argent/actions/createAccount';
import { CreateOZAccountSignature } from '../../../openzeppelin/actions/createAccount';
import { CreateOKXAccountSignature } from '../../../okx/actions/createAccount';
import { CreateBraavosAccountSignature } from '../../../braavos/actions/createAccount';
import { DeployArgentAccountSignature } from '../../../argent/actions/deployAccount';
import { DeployOZAccountSignature } from '../../../openzeppelin/actions/deployAccount';
import { DeployOKXAccountSignature } from '../../../okx/actions/deployAccount';
import { DeployBraavosAccountSignature } from '../../../braavos/actions/deployAccount';

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
      name: 'create_okx_account',
      description:
        'create okx account return the privateKey/publicKey/contractAddress',
      execute: CreateOKXAccountSignature,
    }),
    StarknetSignatureToolRegistry.RegisterSignatureTools({
      name: 'create_braavos_account',
      description:
        'create braavos account return the privateKey/publicKey/contractAddress',
      execute: CreateBraavosAccountSignature,
    }),
    StarknetSignatureToolRegistry.RegisterSignatureTools({
      name: 'deploy_argent_account',
      description:
        'deploy argent account return the privateKey/publicKey/contractAddress',
      schema: accountDetailsSchema,
      execute: DeployArgentAccountSignature,
    }),
    StarknetSignatureToolRegistry.RegisterSignatureTools({
      name: 'deploy_openzeppelin_account',
      description:
        'deploy open_zeppelin account return the privateKey/publicKey/contractAddress',
      schema: accountDetailsSchema,
      execute: DeployOZAccountSignature,
    }),
    StarknetSignatureToolRegistry.RegisterSignatureTools({
      name: 'deploy_okx_account',
      description:
        'deploy okx account return the privateKey/publicKey/contractAddress',
      schema: accountDetailsSchema,
      execute: DeployOKXAccountSignature,
    }),
    StarknetSignatureToolRegistry.RegisterSignatureTools({
      name: 'deploy_braavos_account',
      description:
        'deploy braavos account return the privateKey/publicKey/contractAddress',
      schema: accountDetailsSchema,
      execute: DeployBraavosAccountSignature,
    });
};
