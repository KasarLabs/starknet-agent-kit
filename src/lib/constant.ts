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

export const AVNU_TOKEN_LIST =
  'https://starknet.api.avnu.fi/v1/starknet/tokens';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',

  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',

  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m',
};

const colorLog = {
  error: (msg: string) => console.log(`${colors.red}${msg}${colors.reset}`),
  success: (msg: string) => console.log(`${colors.green}${msg}${colors.reset}`),
  warning: (msg: string) =>
    console.log(`${colors.yellow}${msg}${colors.reset}`),
  info: (msg: string) => console.log(`${colors.cyan}${msg}${colors.reset}`),
  debug: (msg: string) => console.log(`${colors.magenta}${msg}${colors.reset}`),
  custom: (msg: string, color: keyof typeof colors) =>
    console.log(`${colors[color]}${msg}${colors.reset}`),
};
