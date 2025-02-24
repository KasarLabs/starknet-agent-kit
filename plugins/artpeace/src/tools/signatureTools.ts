import { StarknetSignatureToolRegistry } from '@starknet-agent-kit/agents';
import { placePixelSchema } from '../schema';
import { placePixelSignature } from '../actions/placePixel';

export const registerSignatureArtpeaceTools = () => {
  StarknetSignatureToolRegistry.RegisterSignatureTools({
    name: 'place_pixel',
    description: 'Places a pixel, all parameters are optional',
    schema: placePixelSchema,
    execute: placePixelSignature,
  });
};
