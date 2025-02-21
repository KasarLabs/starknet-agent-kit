import { StarknetSignatureToolRegistry } from 'src/lib/agent/tools/signatureTools';
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
