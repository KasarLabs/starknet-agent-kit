import z from 'zod';

export const DeployArgentAccountSchema = z.object({
  publicKeyAX: z
    .string()
    .describe('The public key to deploy the Argent Account'),
  privateKeyAX: z
    .string()
    .describe('The private key to deploy the Argent Account'),
  precalculate_address: z
    .string()
    .describe('The precalculate hash to deploy Argent account'),
});

export const DeployOZAccountSchema = z.object({
  publicKey: z.string().describe('The public key to deploy the OZ Account'),
  privateKey: z.string().describe('The private key to deploy the OZ Account'),
  precalculate_address: z
    .string()
    .describe('The precalculate hash to deploy OZ account'),
});
