import { config } from 'dotenv';

config();

export const tokenAddresses: { [key: string]: string } = {
  ETH: '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
  USDC: '0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8',
  USDT: '0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8',
  STRK: '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d',
};
export const INTERNAL_SERVER_ERROR =
  'Something went wrong, please try again later!';
export const RESSOURCE_NOT_FOUND = 'NOT FOUND';
export const UNAUTHORIZED = 'Unauthorized';
export const FORBIDDEN = 'Forbidden';
export const BAD_REQUEST = 'Bad request';

export const RPC_URL = process.env.RPC_URL;
