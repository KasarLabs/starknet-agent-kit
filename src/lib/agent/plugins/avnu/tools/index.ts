import { StarknetToolRegistry } from 'src/lib/agent/tools/tools';
import { routeSchema, swapSchema } from '../schema';
import { swapTokens } from '../actions/swap';
import { getRoute } from '../actions/fetchRoute';

export const registerAvnuTools = () => {
  // Register DeFi tools
  StarknetToolRegistry.registerTool({
    name: 'swap_tokens',
    description: 'Swap a specified amount of one token for another token',
    schema: swapSchema,
    execute: swapTokens,
  });

  StarknetToolRegistry.registerTool({
    name: 'get_route',
    description: 'Get a specific route for swapping tokens',
    schema: routeSchema,
    execute: getRoute,
  });
};
