import { z } from "zod";

// Get Allowance Schema
export const getAllowanceSchema = z.object({
  spenderAddress: z.string().describe("The address of the account allowed to spend the tokens"),
  assetSymbol: z.string().describe("The symbol of the token (e.g., 'ETH', 'USDC')")
});

// Get Total Supply Schema
export const getTotalSupplySchema = z.string().describe("The symbol of the token to get the total supply for");

// Transfer From Schema
export const transferFromSchema = z.object({
  fromAddress: z.string().describe("The address to transfer tokens from"),
  toAddress: z.string().describe("The address to transfer tokens to"),
  amount: z.string().describe("The amount of tokens to transfer"),
  symbol: z.string().describe("The symbol of the token to transfer")
});

// Transfer From Batch Schema
export const transferFromSignatureSchema = z.object({
  params: z.array(z.object({
    fromAddress: z.string().describe("The address to transfer tokens from"),
    toAddress: z.string().describe("The address to transfer tokens to"),
    amount: z.string().describe("The amount of tokens to transfer"),
    symbol: z.string().describe("The symbol of the token to transfer")
  }))
});

// Get Balance Schema
export const getBalanceSchema = z.object({
  accountAddress: z.string().describe("The address to check the balance for"),
  assetSymbol: z.string().describe("The symbol of the token to check the balance of")
});

// Get Own Balance Schema
export const getOwnBalanceSchema = z.object({
  symbol: z.string().describe("The symbol of the token to check the balance of")
});

// Get Balance Signature Schema
export const getBalanceSignatureSchema = z.object({
  accountAddress: z.string().describe("The address to check the balance for"),
  assetSymbol: z.string().describe("The symbol of the token to check the balance of")
});

// Approve Schema
export const approveSchema = z.object({
  spender_address: z.string().describe("The address being approved to spend tokens"),
  amount: z.string().describe("The amount of tokens being approved"),
  symbol: z.string().describe("The symbol of the token being approved")
});

// Approve Signature Schema
export const approveSignatureSchema = z.object({
  params: z.array(z.object({
    spender_address: z.string().describe("The address being approved to spend tokens"),
    amount: z.string().describe("The amount of tokens being approved"),
    symbol: z.string().describe("The symbol of the token being approved")
  }))
});

// Transfer Schema
export const transferSchema = z.object({
  recipient_address: z.string().describe("The address to receive the tokens"),
  amount: z.string().describe("The amount of tokens to transfer"),
  symbol: z.string().describe("The symbol of the token to transfer")
});

// Transfer Signature Schema
export const transferSignatureSchema = z.object({
  params: z.array(z.object({
    recipient_address: z.string().describe("The address to receive the tokens"),
    amount: z.string().describe("The amount of tokens to transfer"),
    symbol: z.string().describe("The symbol of the token to transfer")
  }))
});