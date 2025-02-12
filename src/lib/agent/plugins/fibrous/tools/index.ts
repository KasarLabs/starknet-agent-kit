import StarknetToolRegistry from 'src/lib/agent/tools/tools';
import { swapSchema } from '../../avnu/schema';
import { swapTokensFibrous } from '../actions/swap';
import { batchSwapSchema, routeSchema } from '../schema';
import { batchSwapTokens } from '../actions/batchSwap';
import { getRouteFibrous } from '../actions/fetchRoute';

export const registerFibrousTools = () => {
  StarknetToolRegistry.registerTool({
    name: 'swap',
    description: 'Swap a token for another token',
    schema: swapSchema,
    execute: swapTokensFibrous,
  });

  StarknetToolRegistry.registerTool({
    name: 'batch_swap',
    description: 'Swap multiple tokens for another token',
    schema: batchSwapSchema,
    execute: batchSwapTokens,
  });

  StarknetToolRegistry.registerTool({
    name: 'route',
    description: 'Get a specific route for swapping tokens',
    schema: routeSchema,
    execute: getRouteFibrous,
  });
};
