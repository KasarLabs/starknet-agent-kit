import { StarknetSignatureToolRegistry } from 'src/lib/agent/tools/signatureTools';
import { placePixelSchema, placeStencilSchema } from '../schema';
import { placePixelSignature } from '../actions/placePixel';
import { placeStencil } from '../actions/placeStencil';

export const registerSignatureArtpeaceTools = () => {
  StarknetSignatureToolRegistry.RegisterSignatureTools({
    name: 'place_pixel',
    description: 'Places a pixel, all parameters are optional',
    schema: placePixelSchema,
    execute: placePixelSignature,
  }),
    StarknetSignatureToolRegistry.RegisterSignatureTools({
      name: 'place_stencil',
      description: 'convert an image on stencil to place pixel',
      schema: placeStencilSchema,
      execute: placeStencil,
    });
};
