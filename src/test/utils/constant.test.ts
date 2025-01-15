import { config } from 'dotenv';

config();

export const _tokenAddresses: { [key: string]: string } = {
  _ETH: '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
  _USDC: '0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8',
  _USDT: '0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8',
  _STRK: '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d',
};
export const _INTERNAL_SERVER_ERROR =
  'Something went wrong, please try again later!';
export const _RESSOURCE_NOT_FOUND = 'NOT FOUND';
export const _UNAUTHORIZED = 'Unauthorized';
export const FORBIDDEN = 'Forbidden';
export const _BAD_REQUEST = 'Bad request';

export const _RPC_URL = process.env.RPC_URL;

export const argentx_classhash =
  '0x1a736d6ed154502257f02b1ccdf4d9d1089f80811cd6acad48e6b6a9d1f2003';
export const VALID_PUBLIC_ADDRESS_1 =
  '0x305cb3052c9ffbb8e5f784f7289a5a2c25fa6df5dcb57b0ce2f9ad300f70cd6';
export const VALID_PUBLIC_ADDRESS_2 =
  '0x6d89353032016c67ebd7c22058e013b5b71994a46be277d2336c3fac0459521';
export const VALID_PUBLIC_ADDRESS_3 =
  '0x7edf8f2f66174f198f2cc937d4c9f7c3a7a2d71984c4c3f05dca549811802ac';
export const VALID_PUBLIC_ADDRESS_4 =
  '0x8c32a21c520c9c706c14f59e1d10106853486168a54ad94e5254b41e4008c1c';
export const VALID_PUBLIC_ADDRESS_5 =
  '0x9e45dd89327a1af0acb2ee910c5862e028cdc1a6d42e3965257a9e44e8c4523';

export const INVALID_PUBLIC_ADDRESS_1 = '0xinvalid';
export const INVALID_PUBLIC_ADDRESS_2 = '123456';

export const VALID_PRIVATE_KEY_1 =
  '0x2a6c110654975ec042002aac4104ad645904af21c38c809d103472822ed51b6';

export const INVALID_PRIVATE_KEY_1 = '0xinvalid';
export const INVALID_PRIVATE_KEY_2 = '123456';
export const INVALID_PRIVATE_KEY_3 = '0x123';
export const INVALID_PRIVATE_KEY_4 = 'notAPrivateKey';
export const INVALID_PRIVATE_KEY_5 = '0xZYXW';

export const VALID_CONTRACT_ADDRESS_1 =
  '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7';
export const VALID_CONTRACT_ADDRESS_2 =
  '0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8';
export const VALID_CONTRACT_ADDRESS_3 =
  '0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8';
export const VALID_CONTRACT_ADDRESS_4 =
  '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d';
export const VALID_CONTRACT_ADDRESS_5 =
  '0x079fe72adc41c6e6b345830ed671dd50d09db8c39552cbc344f3caafb0ca6c79';

export const INVALID_CONTRACT_ADDRESS_1 = '0xinvalid';

export const INVALID_ADDRESS_ERROR = 'Invalid address format';
export const INVALID_PRIVATE_KEY_ERROR = 'Invalid private key format';
export const INVALID_CONTRACT_ADDRESS_ERROR = 'Invalid contract address format';
