import { validateAndParseAddress, uint256 } from 'starknet';

export const validateAddress = (address: string): string => {
  try {
    return validateAndParseAddress(address);
  } catch (error) {
    throw new Error(`Invalid address: ${error.message}`);
  }
};

export const validateAndFormatTokenId = (tokenId: string) => {
  try {
    return uint256.bnToUint256(tokenId);
  } catch (error) {
    throw new Error(`Invalid token ID: ${error.message}`);
  }
};