import StarknetSignatureToolRegistry from 'src/lib/agent/tools/signatureTools';
import StarknetToolRegistry from 'src/lib/agent/tools/tools';
import { placePixel, placePixelSignature } from '../actions/placePixel';
import { placePixelSchema } from '../schema';
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
      execute: placeStencil,
    });
};

export const registerArtpeaceTools = () => {
  StarknetToolRegistry.registerTool({
    name: 'place_pixel',
    plugins: 'art-peace',
    description: 'Places a pixel, all parameters are optional',
    schema: placePixelSchema,
    execute: placePixel,
  });
};
