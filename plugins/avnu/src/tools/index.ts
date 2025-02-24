import {
  StarknetAgentInterface,
  StarknetTool,
} from '@starknet-agent-kit/agents';
import { routeSchema, swapSchema } from '../schema';
import { swapTokens } from '../actions/swap';
import { getRoute } from '../actions/fetchRoute';

export const registerTools = (tool: StarknetTool[]) => {
  tool.push({
    name: 'swap_tokens',
    plugins: 'avnu',
    description: 'Swap a specified amount of one token for another token',
    schema: swapSchema,
    execute: swapTokens,
  });

  tool.push({
    name: 'get_route',
    plugins: 'avnu',
    description: 'Get a specific route for swapping tokens',
    schema: routeSchema,
    execute: getRoute,
  });
};
