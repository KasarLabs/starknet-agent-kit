import {
  StarknetAgentInterface,
  StarknetTool,
} from '@starknet-agent-kit/agents';
import { placePixel } from '../actions/placePixel';
import { placePixelSchema } from '../schema';

export const registerTools = (tool: StarknetTool[]) => {
  tool.push({
    name: 'place_pixel',
    plugins: 'art-peace',
    description: 'Places a pixel, all parameters are optional',
    schema: placePixelSchema,
    execute: placePixel,
  });
};
