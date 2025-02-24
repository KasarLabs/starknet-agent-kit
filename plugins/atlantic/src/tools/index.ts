import {
  StarknetAgentInterface,
  StarknetTool,
} from '@starknet-agent-kit/agents';
import { getProofService } from '../actions/getProofService';
import { GetProofServiceSchema, VerifyProofServiceSchema } from '../schema';
import { verifyProofService } from '../actions/verifyProofService';

export const registerTools = (tool: StarknetTool[]) => {
  tool.push({
    name: 'get_proof_service',
    plugins: 'atlantic',
    description:
      "Query atlantic api to generate a proof from '.zip' file on starknet and return the query id",
    schema: GetProofServiceSchema,
    execute: getProofService,
  });

  tool.push({
    name: 'verify_proof_service',
    plugins: 'atlantic',
    description:
      "Query atlantic api to verify a proof from '.json' file on starknet and return the query id",
    schema: VerifyProofServiceSchema,
    execute: verifyProofService,
  });
};
