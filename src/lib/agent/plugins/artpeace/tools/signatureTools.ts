import { StarknetSignatureToolRegistry } from 'src/lib/agent/tools/signatureTools';
import { getColorsSchema, placePixelSchema, placeStencilSchema } from '../schema';
import { placePixelSignature } from '../actions/placePixel';
import { placeStencil } from '../actions/placeStencil';
import { getColors }  from '../actions/getColors';

export const registerSignatureArtpeaceTools = () => {
  StarknetSignatureToolRegistry.RegisterSignatureTools({
    name: 'place_pixel',
    description: 'Places one or multiple pixels on the canvas. All parameters are optional',
    schema: placePixelSchema,
    execute: placePixelSignature,
  }),
    StarknetSignatureToolRegistry.RegisterSignatureTools({
      name: 'place_stencil',
      description: 'convert an image on stencil to place pixel',
      schema: placeStencilSchema,
      execute: placeStencil,
    });
    StarknetSignatureToolRegistry.RegisterSignatureTools({
      name: 'get_colors',
      description: 'Checks and suggests available colors for pixel placement. Provide a color description or hex code to find the closest match.',
      schema: getColorsSchema,
      execute: getColors
    })
};

