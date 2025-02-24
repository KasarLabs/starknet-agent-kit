
import { z } from 'zod';

export const getBalanceSchema = z.object({
  accountAddress: z.string().describe('The address to check the balance for'),
  contractAddress: z.string().describe('The address of the NFT contract'),
});

export const ownerOfSchema = z.object({
  tokenId: z.string().describe('The ID of the token'),
  contractAddress: z.string().describe('The address of the NFT contract'),
});

export const getApprovedSchema = z.object({
  tokenId: z.string().describe('The ID of the token'),
  contractAddress: z.string().describe('The address of the NFT contract'),
});

export const isApprovedForAllSchema = z.object({
  ownerAddress: z.string().describe('The address of the token owner'),
  operatorAddress: z.string().describe('The address of the operator to check'),
  contractAddress: z.string().describe('The address of the NFT contract'),
});

export const transferFromSchema = z.object({
  fromAddress: z.string().describe('The current owner of the token'),
  toAddress: z.string().describe('The address to receive the token'),
  tokenId: z.string().describe('The ID of the token to transfer'),
  contractAddress: z.string().describe('The address of the NFT contract'),
});

export const safeTransferFromSchema = z.object({
  fromAddress: z.string().describe('The current owner of the token'),
  toAddress: z.string().describe('The address to receive the token'),
  tokenId: z.string().describe('The ID of the token to transfer'),
  contractAddress: z.string().describe('The address of the NFT contract'),
  data: z.string().optional().describe('Additional data with the transfer'),
});

export const approveSchema = z.object({
  approvedAddress: z.string().describe('The address being approved for the token'),
  tokenId: z.string().describe('The ID of the token'),
  contractAddress: z.string().describe('The address of the NFT contract'),
});

export const setApprovalForAllSchema = z.object({
  operatorAddress: z.string().describe('The operator address to set approval for'),
  approved: z.boolean().describe('True to approve, false to revoke'),
  contractAddress: z.string().describe('The address of the NFT contract'),
});
