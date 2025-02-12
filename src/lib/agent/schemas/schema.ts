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

export const batchSwapSchema = z.object({
  sellTokenSymbols: z.array(z.string()).describe('Symbols of tokens to sell'),
  buyTokenSymbol: z
    .string()
    .describe("Symbol of the token to buy (e.g., 'ETH', 'USDC')"),
  sellAmounts: z.array(z.number()).describe('Amounts of tokens to sell'),
});

export const routeSchema = z.object({
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

export const getClassAtSchema = blockIdAndContractAddressSchema.merge(
  z.object({
    key: z
      .string()
      .describe('The class for the given contract at the given block'),
  })
);

export const getClassHashAtSchema = blockIdAndContractAddressSchema.merge(
  z.object({
    key: z
      .string()
      .describe('The class hash for the given contract at the given block'),
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

// In schema.ts

//Vesu integration

export const depositEarnSchema = z.object({
  depositTokenSymbol: z
    .string()
    .describe("Symbol of the token to deposit (e.g., 'ETH', 'USDC')"),
  depositAmount: z.string().describe('Amount of tokens to deposit'),
});

export const withdrawEarnSchema = z.object({
  withdrawTokenSymbol: z
    .string()
    .describe("Symbol of the token to withdraw (e.g., 'ETH', 'USDC')"),
});

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
  payloads: z.array(callSchema),
});

/* For simulate Deploy Account Transaction*/

const PayloadDeployAccountSchema = z.object({
  classHash: z.string().describe('The class Hash Address'),
  constructorCalldata: z.array(z.string()).or(z.record(z.any())).optional(),
  addressSalt: z
    .union([z.string().regex(/^0x[0-9a-fA-F]+$/), z.number(), z.bigint()])
    .optional(),
  contractAddressSchema: z.string().describe('ContractAddress').optional(),
});

export const simulateDeployAccountTransactionSchema = z.object({
  accountAddress: z.string().describe('Account Address'),
  payloads: z.array(PayloadDeployAccountSchema),
});

/* For simulate Deploy Transaction */

const PayloadDeploySchema = z.object({
  classHash: z.union([
    z.string().regex(/^0x[0-9a-fA-F]+$/),
    z.number(),
    z.bigint().describe('The class Hash Address'),
  ]),
  addressSalt: z
    .union([z.string().regex(/^0x[0-9a-fA-F]+$/), z.number(), z.bigint()])
    .optional(),
  unique: z
    .union([
      z.string().regex(/^0x[0-9a-fA-F]+$/),
      z.boolean().describe('unique true or false'),
    ])
    .optional(),
  constructorCalldata: z.array(z.string()).or(z.record(z.any())).optional(),
});

export const simulateDeployTransactionSchema = z.object({
  accountAddress: z.string().describe('Account Address'),
  payloads: z.array(PayloadDeploySchema),
});

/* For simulate Declare Contract Transaction*/
const cairoAssemblySchema = z.object({
  prime: z.string(),
  compiler_version: z.string(),
  bytecode: z.array(z.string()),
  hints: z.record(z.any()),
  entry_points_by_type: z.object({
    CONSTRUCTOR: z.array(z.any()),
    EXTERNAL: z.array(z.any()),
    L1_HANDLER: z.array(z.any()),
  }),
});

const compiledContractSchema = z.object({
  program: z.any(),
  entry_points_by_type: z.any(),
});

export const simulateDeclareTransactionSchema = z.object({
  accountAddress: z.string().describe('Account address'),
  contract: z
    .union([z.string(), compiledContractSchema])
    .describe('Contract data'),
  classHash: z.string().optional().describe('Class hash of the contract'),
  casm: cairoAssemblySchema.optional().describe('Cairo assembly data'),
  compiledClassHash: z.string().optional().describe('Compiled class hash'),
});

/* for estimate account deploye fee */
export const estimateAccountDeployFeeSchema = z.object({
  accountAddress: z.string().describe('Account Address'),
  payloads: z.array(PayloadDeployAccountSchema),
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

// Schema for memecoin creation parameters
export const createMemecoinSchema = z.object({
  owner: z.string().describe('Owner address of the memecoin'),
  name: z.string().describe('Name of the memecoin'),
  symbol: z.string().describe('Symbol/ticker of the memecoin'),
  initialSupply: z.string().describe('Initial supply of tokens (in wei)'),
  salt: z
    .string()
    .optional()
    .describe('Optional salt for contract address generation'),
});

/* Schema for artpeace implementation */
export const placePixelParamSchema = z.object({
  canvasId: z
    .union([z.number(), z.string()])
    .default(0)
    .describe(
      'The id or the unique name of the world to dispose the pixel, if is not provided set by default 0'
    ),
  xPos: z.number().describe('The position on x axe of the pixel'),
  yPos: z.number().describe('The position on y axe of the pixel'),
  color: z
    .string()
    .default('0')
    .describe('The color of the pixel, if is not provided set by default 0'),
});

export const placePixelSchema = z.object({
  params: z
    .array(placePixelParamSchema)
    .describe('Array of parameter to place one or multiple pixel'),
});

/**
 * Schema for the initial launch parameters
 */
const launchParametersSchema = z
  .object({
    // Memecoin contract address
    memecoinAddress: z
      .string()
      .regex(/^0x[0-9a-fA-F]{63,64}$/)
      .describe('Address of the memecoin contract to be launched'),

    // Transfer restriction delay (in seconds)
    transferRestrictionDelay: z
      .number()
      .min(0)
      .describe(
        'Time period in seconds during which transfers are restricted after launch. Example: 86400 for 24 hours'
      ),

    // Maximum percentage that can be bought at launch
    maxPercentageBuyLaunch: z
      .number()
      .min(1)
      .max(100)
      .describe(
        'Maximum percentage of total supply that can be bought by a single address at launch. Range: 1-100'
      ),

    // Quote token address (e.g., ETH)
    quoteAddress: z
      .string()
      .regex(/^0x[0-9a-fA-F]{63,64}$/)
      .describe(
        'Address of the quote token (e.g., ETH) used for the trading pair'
      ),

    // Initial token holders
    initialHolders: z
      .array(z.string().regex(/^0x[0-9a-fA-F]{63,64}$/))
      .min(1)
      .describe(
        'Array of addresses that will receive initial token distribution'
      ),

    // Initial token amounts for each holder
    initialHoldersAmounts: z
      .array(z.string())
      .min(1)
      .describe(
        'Array of token amounts (in wei) to be distributed to initial holders'
      ),
  })
  .refine(
    (data) => data.initialHolders.length === data.initialHoldersAmounts.length,
    {
      message: 'Initial holders and amounts arrays must have the same length',
    }
  );

/**
 * Schema for Ekubo-specific pool parameters
 */
const ekuboPoolParametersSchema = z.object({
  // Pool fee in basis points (1 bp = 0.01%)
  fee: z
    .string()
    .refine(
      (value) => {
        const fee = parseInt(value);
        return fee >= 1 && fee <= 10000; // 0.01% to 100%
      },
      {
        message: 'Fee must be between 1 and 10000 basis points (0.01% to 100%)',
      }
    )
    .describe('Pool fee in basis points. Example: "3000" for 0.3%'),

  // Tick spacing for the pool
  tickSpacing: z
    .string()
    .describe(
      'Determines the granularity of price points in the pool. Common values: "60" for 0.3% pools'
    ),

  // Starting price configuration
  startingPrice: z.object({
    // Magnitude of the price
    mag: z
      .string()
      .describe(
        'Magnitude of the starting price in wei. Example: "1000000000000000000" for 1.0'
      ),

    // Price direction (positive/negative)
    sign: z.boolean().describe('true for positive price, false for negative'),
  }),

  // Pool bound parameter
  bound: z
    .string()
    .describe(
      'Defines the price range limit for the concentrated liquidity pool'
    ),
});

export const launchOnEkuboSchema = z.object({
  launchParams: launchParametersSchema,
  ekuboParams: ekuboPoolParametersSchema,
});

// Twitter

export const createTwitterpostSchema = z.object({
  post: z.string().describe('This is the string you want to post on X'),
});

export const getLastUserXTweetSchema = z.object({
  account_name: z
    .string()
    .describe('This is the account_name you want to get the latest tweet'),
});

export const ReplyTweetSchema = z.object({
  tweet_id: z.string().describe('The tweet id you want to reply'),
  response_text: z
    .string()
    .describe('This is the response you will send to the tweet'),
});

export const getLastTweetsOptionsSchema = z.object({
  query: z
    .string()
    .describe(
      'The search query . Any Twitter-compatible query format can be used'
    ),
  maxTeets: z.number().describe('The max tweets you want to get'),
  reply: z
    .boolean()
    .describe('If you want to include replyed tweet in your request'),
});

export const FollowXUserFromUsernameSchema = z.object({
  username: z.string().describe('The username you want to follow'),
});

export const getTwitterProfileFromUsernameSchema = z.object({
  username: z.string().describe('The username you want to get the profile'),
});

export const getTwitterUserIdFromUsernameSchema = z.object({
  username: z.string().describe('The username you want get the user_id'),
});

export const getLastTweetsAndRepliesFromUserSchema = z.object({
  username: z
    .string()
    .describe('The username you want to get last tweets and replies'),
  maxTweets: z
    .number()
    .describe('The number of tweets/replies you want to get from a User')
    .optional(),
});

export const getLastTweetsFromUserSchema = z.object({
  username: z.string().describe('The username you want to get last tweets'),
  maxTweets: z
    .number()
    .describe('The number of tweets you want to get from a User')
    .optional(),
});

export const createAndPostTwitterThreadSchema = z.object({
  thread: z
    .array(z.string())
    .describe(
      'This is the array of where every index of this array contain a part of your thread'
    ),
});

// CoinGecko

const CoinGeckoCheckTokenPayload = z.object({
  name: z.string().describe('the name of the token'),
});
export const CoinGeckoCheckTokenPriceSchema = z.object({
  tokens: z.array(CoinGeckoCheckTokenPayload).describe('Array of tokens name'),
});

// Types for function parameters that match the schemas
export type LaunchOnEkuboParams = z.infer<typeof launchOnEkuboSchema>;
export type CreateMemecoinParams = z.infer<typeof createMemecoinSchema>;
export type GetStorageParams = z.infer<typeof getStorageAtSchema>;
export type GetClassAtParams = z.infer<typeof getClassAtSchema>;
export type BlockIdParams = z.infer<typeof blockIdSchema>;
export type TransactionHashParams = z.infer<typeof transactionHashSchema>;
export type BlockIdAndContractAddressParams = z.infer<
  typeof blockIdAndContractAddressSchema
>;
export type GetTransactionByBlockIdAndIndexParams = z.infer<
  typeof getTransactionByBlockIdAndIndexSchema
>;
export type ContractAddressParams = z.infer<typeof contractAddressSchema>;
export type CoinGeckoCheckTokenPriceParams = z.infer<
  typeof CoinGeckoCheckTokenPriceSchema
>;
export type getLastUserXTweetParams = z.infer<typeof getLastUserXTweetSchema>;
export type ReplyTweetParams = z.infer<typeof ReplyTweetSchema>;
export type getLastTweetsOptionsParams = z.infer<
  typeof getLastTweetsOptionsSchema
>;
export type FollowXUserFromUsernameParams = z.infer<
  typeof FollowXUserFromUsernameSchema
>;
export type getTwitterProfileFromUsernameParams = z.infer<
  typeof getTwitterProfileFromUsernameSchema
>;
export type getTwitterUserIdFromUsernameParams = z.infer<
  typeof getTwitterUserIdFromUsernameSchema
>;
export type getLastTweetsAndRepliesFromUserParams = z.infer<
  typeof getLastTweetsAndRepliesFromUserSchema
>;
export type getLastTweetsFromUserParams = z.infer<
  typeof getLastTweetsFromUserSchema
>;
export type createAndPostTwitterThreadParams = z.infer<
  typeof createAndPostTwitterThreadSchema
>;
export type creatTwitterPostParams = z.infer<typeof createTwitterpostSchema>;
