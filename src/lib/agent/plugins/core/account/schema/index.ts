import z from 'zod';


/**
 * Zod schema for validating account details.
 * @type {z.ZodObject<{
 *   contractAddress: z.ZodString,
 *   publicKey: z.ZodString,
 *   privateKey: z.ZodString
 * }>}
 */
export const accountDetailsSchema = z.object({
  contractAddress: z.string().describe("The address of the account's contract"),
  publicKey: z.string().describe('The public key of the account'),
  privateKey: z.string().describe('The private key of the account'),
});

// For sign message
export const signMessageSchema = z.object({
  typedData: z
    .object({
      types: z.record(
        z.string(),
        z.array(
          z.object({
            name: z.string(),
            type: z.string(),
          })
        )
      ),
      primaryType: z.string(),
      domain: z.record(z.string(), z.union([z.string(), z.number()])),
      message: z.record(z.string(), z.any()),
    })
    .describe('The typed data object conforming to EIP-712'),
});

// For verify message
export const verifyMessageSchema = z.object({
  typedData: z
    .object({
      types: z.record(
        z.string(),
        z.array(
          z.object({
            name: z.string(),
            type: z.string(),
          })
        )
      ),
      primaryType: z.string(),
      domain: z.record(z.string(), z.union([z.string(), z.number()])),
      message: z.record(z.string(), z.any()),
    })
    .describe('The typed data that was signed'),
  signature: z
    .array(z.string())
    .length(2)
    .describe('The signature as array of r and s values'),
  publicKey: z.string().describe('The public key to verify against'),
});
