/**
 * Parameters for retrieving own wallet balance
 * @property {string} symbol - The token symbol to check balance for
 */
export type GetOwnBalanceParams = {
  symbol: string;
};

/**
 * Parameters for retrieving balance of a specific wallet
 * @property {string} walletAddress - The address of the wallet to check
 * @property {string} assetSymbol - The token symbol to check balance for
 */
export type GetBalanceParams = {
  walletAddress: string;
  assetSymbol: string;
};
