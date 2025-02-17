import { StarknetToolRegistry } from 'src/lib/agent/tools/tools';
import { routeSchema, swapSchema } from '../schema';
import { swapTokens } from '../actions/swap';
import { getRoute } from '../actions/fetchRoute';

export const registerAvnuTools = () => {
  StarknetToolRegistry.registerTool({
    name: 'swap_tokens',
    plugins: 'avnu',
    description: 'Swap a specified amount of one token for another token',
    schema: swapSchema,
    execute: swapTokens,
  });

  StarknetToolRegistry.registerTool({
    name: 'get_route',
    plugins: 'avnu',
    description: 'Get a specific route for swapping tokens',
    schema: routeSchema,
    execute: getRoute,
  });
};
