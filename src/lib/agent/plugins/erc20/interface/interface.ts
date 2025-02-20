import { Uint256 } from 'starknet';

export interface ParamsValidationResult {
    formattedSymbol: string;
    formattedAddress: string;
    tokenAddress: string;
    formattedAmountUint256: Uint256;
}