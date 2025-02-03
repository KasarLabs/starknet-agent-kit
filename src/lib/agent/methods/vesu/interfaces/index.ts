import { z } from 'zod';
import { Hex, hexSchemaBase } from '../utils/num';
import { validateChecksumAddress } from 'starknet';

export type Address = `0x${string}`;

export const addressSchema = hexSchemaBase
  .min(50, 'Address must be at least 50 characters long')
  .max(66, 'Address must be at most 66 characters long')
  .refine((value) => {
    // if it contains uppercase letters, it must match the checksum
    if (/[A-F]/.test(value)) {
      return validateChecksumAddress(value);
    }
    // if it only contains lowercase letters, it's valid
    return true;
  }, 'Address is not a valid checksum address')
  .transform<Address>((value) => {
    // remove 0x prefix
    const withoutPrefix = value.startsWith('0x') ? value.slice(2) : value;
    // pad left until length is 64
    const padded = withoutPrefix.padStart(64, '0');
    // add 0x prefix
    return `0x${padded}`;
  })
  .or(z.literal('0x0'));

export interface ITokenValue {
  value: bigint;
  decimals: number;
}
export interface IBaseToken {
  name: string;
  address: Hex;
  symbol: string;
  decimals: number;
  usdPrice?: ITokenValue;
}

export interface IPoolAssetPair {
  collateralAssetAddress: Hex;
  debtAssetAddress: Hex;
  maxLTV: ITokenValue;
}

export interface IPoolAsset extends IBaseToken {
  vToken: IBaseToken;
  listedBlockNumber: number;
  config: {
    debtFloor: ITokenValue;
    isLegacy: boolean;
    feeRate: ITokenValue;
    lastFullUtilizationRate: ITokenValue;
    lastRateAccumulator: ITokenValue;
    lastUpdated: Date;
    maxUtilization: ITokenValue;
    reserve: ITokenValue;
    totalCollateralShares: ITokenValue;
    totalNominalDebt: ITokenValue;
  };
  interestRate: ITokenValue;
  stats: {
    totalSupplied: ITokenValue;
    totalDebt: ITokenValue;
    currentUtilization: ITokenValue;
    supplyApy: ITokenValue;
    defiSpringSupplyApr: ITokenValue | null;
    lstApr: ITokenValue | null;
    borrowApr: ITokenValue;
  };
}
export interface IPool {
  id: string;
  name: string;
  owner: Hex;
  // shutdownStatus: PoolShutdownStatus
  extensionContractAddress: Hex;
  isVerified: boolean;
  assets: IPoolAsset[];
  stats?: {
    usdTotalSupplied: ITokenValue;
    usdTotalBorrowed: ITokenValue;
  };
  pairs?: IPoolAssetPair[];
}

export const poolParser = z.object({
  id: z.string(),
  name: z.string(),
  owner: addressSchema,
  extensionContractAddress: addressSchema,
  isVerified: z.boolean(),
  assets: z.any(),
  pairs: z.any(),
  // assets: z.array(poolAssetParser),
  // pairs: z.array(poolPairParser),
});

export interface DepositParams {
  depositTokenSymbol: string;
  depositAmount: string;
}

export interface WithdrawParams {
  withdrawTokenSymbol: string;
}

export interface BigDecimal {
  value: bigint;
  decimals: number;
}

export interface DepositResult {
  status: 'success' | 'failure';
  amount?: string;
  symbol?: string;
  recipients_address?: string;
  transaction_hash?: string;
  error?: string;
  step?: string;
}

export interface WithdrawResult {
  status: 'success' | 'failure';
  symbol?: string;
  recipients_address?: string;
  transaction_hash?: string;
  error?: string;
  step?: string;
}
