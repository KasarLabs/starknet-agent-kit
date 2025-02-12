import { StarknetToolRegistry } from 'src/lib/agent/tools/tools';
import {
  contractAddressSchema,
  launchOnEkuboSchema,
  createMemecoinSchema,
} from '../schema';
import { getLockedLiquidity } from '../actions/getLockedLiquidity';
import { isMemecoin } from '../actions/isMemecoin';
import { createMemecoin } from '../actions/createMemecoin';
import { launchOnEkubo } from '../actions/launchOnEkubo';

export const registerUnraggableTools = () => {
  StarknetToolRegistry.registerTool({
    name: 'is_memecoin',
    description: 'Check if address is a memecoin',
    schema: contractAddressSchema,
    execute: isMemecoin,
  });

  StarknetToolRegistry.registerTool({
    name: 'get_locked_liquidity',
    description: 'Get locked liquidity info for token',
    schema: contractAddressSchema,
    execute: getLockedLiquidity,
  });

  StarknetToolRegistry.registerTool({
    name: 'create_memecoin',
    description: 'Create a new memecoin using the Unruggable Factory',
    schema: createMemecoinSchema,
    execute: createMemecoin,
  });

  StarknetToolRegistry.registerTool({
    name: 'launch_on_ekubo',
    description: 'Launch a memecoin on Ekubo DEX with concentrated liquidity',
    schema: launchOnEkuboSchema,
    execute: launchOnEkubo,
  });
};
