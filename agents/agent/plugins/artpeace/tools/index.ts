import { StarknetToolRegistry } from 'agents/agent/tools/tools';
import { placePixel } from '../actions/placePixel';
import { placePixelSchema } from '../schema';

export const registerArtpeaceTools = () => {
  StarknetToolRegistry.registerTool({
    name: 'place_pixel',
    plugins: 'art-peace',
    description: 'Places a pixel, all parameters are optional',
    schema: placePixelSchema,
    execute: placePixel,
  });
};
