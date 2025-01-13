import { z } from 'zod';

// Schema definitions
export const Transferschema = z.object({
  recipient_address: z.string().describe('The recipient public address'),
  amount: z.string().describe('The amount of erc20 token that will be send'),
  symbol: z.string().describe('The symbol of the erc20 token'),
});

export const blockIdSchema = z.object({
  blockId: z.union([
    z
      .string()
      .describe(
        "The block identifier. Can be 'latest', 'pending', or a block hash."
      ),
    z.number().describe('A block number.'),
  ]),
});

export const contractAddressSchema = z.object({
  contractAddress: z.string().describe('The address of the contract'),
});

export const transactionHashSchema = z.object({
  transactionHash: z
    .string()
    .describe('The hash of the requested transaction.'),
});

export const DeployOZAccountSchema = z.object({
  publicKey: z.string().describe('The public key to deploy the OZ Account'),
  privateKey: z.string().describe('The private key to deploy the OZ Account'),
});

export const getOwnBalanceSchema = z.object({
  symbol: z
    .string()
    .describe('The asset symbol to get the balance of. eg. USDC, ETH'),
});

export const getBalanceSchema = z.object({
  walletAddress: z
    .string()
    .describe('The wallet address to get the balance of'),
  assetSymbol: z
    .string()
    .describe('The asset symbol to get the balance of. eg. USDC, ETH'),
});

export const DeployArgentAccountSchema = z.object({
  publicKeyAX: z
    .string()
    .describe('The public key to deploy the Argent Account'),
  privateKeyAX: z
    .string()
    .describe('The private key to deploy the Argent Account'),
});

export const blockIdAndContractAddressSchema = blockIdSchema
  .merge(contractAddressSchema)
  .strict();

export const swapSchema = z.object({
  sellTokenSymbol: z
    .string()
    .describe("Symbol of the token to sell (e.g., 'ETH', 'USDC')"),
  buyTokenSymbol: z
    .string()
    .describe("Symbol of the token to buy (e.g., 'ETH', 'USDC')"),
  sellAmount: z.number().positive().describe('Amount of tokens to sell'),
});

export const getStorageAtSchema = blockIdAndContractAddressSchema.merge(
  z.object({
    key: z
      .string()
      .describe('The key to the storage value for the given contract'),
  })
);

export const getTransactionByBlockIdAndIndexSchema = blockIdSchema.merge(
  z.object({
    transactionIndex: z
      .number()
      .int()
      .nonnegative()
      .describe('The index of the transaction within the block.'),
  })
);

// Types for function parameters that match the schemas
export type GetStorageParams = z.infer<typeof getStorageAtSchema>;
export type BlockIdParams = z.infer<typeof blockIdSchema>;
export type TransactionHashParams = z.infer<typeof transactionHashSchema>;
export type BlockIdAndContractAddressParams = z.infer<
  typeof blockIdAndContractAddressSchema
>;
export type GetTransactionByBlockIdAndIndexParams = z.infer<
  typeof getTransactionByBlockIdAndIndexSchema
>;

// In schema.ts

// For declare contract
export const declareContractSchema = z.object({
  contract: z.any().describe('The compiled contract to be declared'),
  classHash: z.string().optional().describe('Optional pre-computed class hash'),
  compiledClassHash: z
    .string()
    .optional()
    .describe('Optional compiled class hash for Cairo 1 contracts'),
});

/* For simulate Invoke Transaction */

const callSchema = z.object({
  contractAddress: z.string().describe('The contract Address'),
  entrypoint: z.string().describe('The entrypoint'),
  calldata: z.array(z.string()).or(z.record(z.any())).optional(),
});

export const simulateInvokeTransactionSchema = z.object({
  accountAddress: z.string().describe('Account Address/public key'),
  calls: z.array(callSchema),
});

/* For simulate Deploy Account Transaction*/
const PayloadDeploySchema = z.object({
  classHash: z.string().describe('The class Hash Address'),
  constructorCalldata: z.array(z.string()).or(z.record(z.any())).optional(),
  addressSalt: z
    .union([z.string().regex(/^0x[0-9a-fA-F]+$/), z.number(), z.bigint()])
    .optional(),
  contractAddressSchema: z.string().describe('ContractAddress').optional(),
});

export const simulateDeployAccountTransactionSchema = z.object({
  accountAddress: z.string().describe('Account Address'),
  payloads: z.array(PayloadDeploySchema),
});

/* for estimate account deploye fee */
export const estimateAccountDeployFeeSchema = z.object({
  classHash: z
    .string()
    .describe('The class hash of the account contract to deploy'),
  constructorCalldata: z
    .array(z.string())
    .optional()
    .describe('Optional constructor parameters'),
  addressSalt: z
    .string()
    .optional()
    .describe('Optional salt for the contract address'),
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

// Add type exports for the schemas
export type DeclareContractParams = z.infer<typeof declareContractSchema>;
export type EstimateAccountDeployFeeParams = z.infer<
  typeof estimateAccountDeployFeeSchema
>;
export type SignMessageParams = z.infer<typeof signMessageSchema>;
export type VerifyMessageParams = z.infer<typeof verifyMessageSchema>;
