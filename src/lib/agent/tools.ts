import { tool } from "@langchain/core/tools";
import {
  CreateOZAccount,
  CreateArgentAccount,
} from "src/lib/agent/method/account/createAccount";
import { DeployArgentAccount } from "src/lib/agent/method/account/deployAccount";
import { z } from "zod";
import { getOwnBalance, getBalance } from "./method/read/balance";
import { getBlockNumber } from "./method/read/rpc/getBlockNumber";
import { getBlockTransactionCount } from "./method/read/rpc/getBlockTransactionCount";
import { getStorageAt } from "./method/read/rpc/getStorageAt";
import { getClassAt } from "./method/read/rpc/getClassAt";
import { getClassHash } from "./method/read/rpc/getClassHash";
import { createDomain } from "./method/starknet_id/createDomain";
import { BlockIdentifier } from "starknet";

// Types
type StarknetAgentInterface = {
  getCredentials: () => { walletPrivateKey: string };
};

/**
 * Wraps a function to inject the wallet private key from the agent
 */
const withWalletKey = <T>(
  fn: (params: T, privateKey: string) => Promise<any>,
  agent: StarknetAgentInterface,
) => {
  return (params: T) => fn(params, agent.getCredentials().walletPrivateKey);
};

// Schema definitions
const getOwnBalanceSchema = z.object({
  symbol: z
    .string()
    .describe("The asset symbol to get the balance of. eg. USDC, ETH"),
});

const getBalanceSchema = z.object({
  walletAddress: z
    .string()
    .describe("The wallet address to get the balance of"),
  assetSymbol: z
    .string()
    .describe("The asset symbol to get the balance of. eg. USDC, ETH"),
});

const DeployArgentAccountSchema = z.object({
  publicKeyAX: z
    .string()
    .describe("The public key to deploy the Argent Account"),
  privateKeyAX: z
    .string()
    .describe("The private key to deploy the Argent Account"),
});

const getStorageAtSchema = z.object({
  contractAddress: z
    .string()
    .describe("The contract address to get storage from"),
  key: z.string().describe("The storage slot key to query"),
  blockIdentifier: z
    .string()
    .optional()
    .describe("Block identifier (optional, defaults to 'latest')"),
});

const getBlockTransactionCountSchema = z.object({
  blockIdentifier: z
    .string()
    .optional()
    .describe("Block identifier (optional, defaults to 'latest')"),
});

const getClassAtSchema = z
  .object({
    contractAddress: z
      .string()
      .describe("The contract address to get the class from"),
    blockIdentifier: z
      .union([z.literal("latest"), z.string().regex(/^[0-9]+$/), z.number()])
      .optional()
      .describe("Block identifier (optional, defaults to 'latest')"),
  })
  .strict();

const getClassHashSchema = z
  .object({
    contractAddress: z
      .string()
      .describe("The contract address to get the class hash from"),
    blockIdentifier: z
      .union([
        z.literal("latest"),
        z.number(),
        z.string().regex(/^0x[0-9a-fA-F]+$/),
      ])
      .optional()
      .default("latest")
      .describe("Block identifier (defaults to 'latest')"),
  })
  .strict();

const createDomainSchema = z.object({
  domain: z.string().describe("The domain name to create (must end with .stark)"),
  recipient: z.string().describe("The recipient address for the domain")
});

// Types for function parameters that match the schemas
type GetClassAtParams = z.infer<typeof getClassAtSchema>;
type GetClassHashParams = z.infer<typeof getClassHashSchema>;

/**
 * Creates and returns all tools with injected agent credentials
 */
export const createTools = (agent: StarknetAgentInterface) => [
  tool(withWalletKey(createDomain, agent), {
    name: "create_domain",
    description: "Create a new Starknet ID domain name that must end with .stark",
    schema: createDomainSchema,
  }),
  tool(withWalletKey(getOwnBalance, agent), {
    name: "get_own_balance",
    description: "Get the balance of an asset in your wallet",
    schema: getOwnBalanceSchema,
  }),
  tool(getBalance, {
    name: "get_balance",
    description: "Get the balance of an asset for a given wallet address",
    schema: getBalanceSchema,
  }),
  tool(CreateOZAccount, {
    name: "CreateOZAccount",
    description: "Create Open Zeppelin account",
  }),
  tool(CreateArgentAccount, {
    name: "CreateArgentAccount",
    description: "Create Account account",
  }),
  tool(DeployArgentAccount, {
    name: "DeployArgent",
    description: "Deploy a Argent Account",
    schema: DeployArgentAccountSchema,
  }),
  tool(getBlockNumber, {
    name: "get_block_number",
    description: "Get the current block number from the Starknet network",
  }),
  tool(getBlockTransactionCount, {
    name: "get_block_transaction_count",
    description: "Get the number of transactions in a specific block",
    schema: getBlockTransactionCountSchema,
  }),
  tool(getStorageAt, {
    name: "get_storage_at",
    description: "Get the storage value at a specific slot for a contract",
    schema: getStorageAtSchema,
  }),
  tool(getClassAt, {
    name: "get_class_at",
    description: "Get the class definition of a contract at a specific address",
    schema: getClassAtSchema,
  }),
  tool(getClassHash, {
    name: "get_class_hash",
    description: "Get the class hash for a contract at a specific address",
    schema: getClassHashSchema,
  }),
];