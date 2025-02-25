import { SignatureTool } from '@starknet-agent-kit/agents';
import { placePixelSchema } from '../schema';
import { placePixelSignature } from '../actions/placePixel';

export const registerSignatureTools = (tools: SignatureTool[]) => {
  tools.push({
    name: 'place_pixel',
    description: 'Places a pixel, all parameters are optional',
    schema: placePixelSchema,
    execute: placePixelSignature,
  });
};
