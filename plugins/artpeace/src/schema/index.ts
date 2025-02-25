import { z } from 'zod';

export const placePixelParamSchema = z.object({
  canvasId: z
    .union([z.number(), z.string()])
    .optional()
    .default(0)
    .describe('The id or the unique name of the world to dispose the pixel'),
  xPos: z
    .number()
    .optional()
    .nullable()
    .describe('The position on x axe of the pixel'),
  yPos: z
    .number()
    .optional()
    .nullable()
    .describe('The position on y axe of the pixel'),
  color: z
    .string()
    .optional()
    .default('0')
    .describe('The color of the pixel by name or by hexadecimal'),
});

export const placePixelSchema = z.object({
  params: z
    .array(placePixelParamSchema)
    .describe(
      'Array of parameter to place one or multiple pixel, all parameters are optional'
    ),
});

export const Transferschema = z.object({
  recipient_address: z.string().describe('The recipient public address'),
  amount: z.string().describe('The amount'),
  symbol: z.string().describe('The symbol of the erc20 token'),
});

export const transferSignatureschema = z.object({
  payloads: z
    .array(Transferschema)
    .describe('Array of payloads for a tranfer transaction'),
});

export const DeployArgentAccountSignatureSchema = z.object({
  publicKeyAX: z
    .string()
    .describe('The public key to deploy the Argent Account'),
  privateKeyAX: z
    .string()
    .describe('The private key to deploy the Argent Account'),
});

export const getBalanceSignatureSchema = z.object({
  accountAddress: z.string().describe('the account address'),
  assetSymbol: z.string().describe('token Symbol'),
});


export type placePixelParam = z.infer<typeof placePixelParamSchema>;
