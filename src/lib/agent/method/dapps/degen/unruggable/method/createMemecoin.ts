import { CreateMemecoinParams } from 'src/lib/agent/schema';
import { stark, uint256 } from 'starknet';
import { rpcProvider } from 'src/lib/agent/starknetAgent';
import { Entrypoint, DECIMALS } from 'src/lib/utils/unruggable';
import { execute, decimalsScale } from 'src/lib/utils/unruggable/helper';


/**
 * Creates a new memecoin using the Unruggable Factory.
 * 
 * This function deploys a new memecoin contract with specified parameters through the
 * Unruggable Factory. It handles the creation process including proper decimal scaling
 * and salt generation for the contract address.
 * 
 * @param {CreateMemecoinParams} params - Parameters for the memecoin creation
 * @param {string} privateKey - Private key for transaction signing
 * @returns {Promise<string | CreateMemecoinErrorResponse>} JSON string for success or error object
 * 
 * @example
 * ```typescript
 * // Create a new memecoin
 * const result = await createMemecoin({
 *   owner: "0x123...",  // Owner address
 *   name: "Pepe Token", // Token name
 *   symbol: "PEPE",     // Token symbol
 *   initialSupply: "1000000" // 1 million tokens (will be scaled by decimals)
 * }, "your_private_key");
 * 
 * // Handle the response
 * try {
 *   const response = typeof result === 'string' 
 *     ? JSON.parse(result) 
 *     : result;
 *   
 *   if (response.status === 'success') {
 *     console.log('Transaction hash:', response.transactionHash);
 *     console.log('View transaction: https://voyager.online/tx/' + response.transactionHash);
 *   } else {
 *     console.error('Creation failed:', response.error);
 *   }
 * } catch (error) {
 *   console.error('Error parsing response:', error);
 * }
 * ```
 * 
 * @throws Will return error response if:
 * - Invalid owner address format
 * - Invalid token name or symbol format
 * - Initial supply is not a valid number
 * - Transaction signing fails
 * - Contract deployment fails
 * 
 * @note
 * - Initial supply is automatically scaled by 18 decimals
 * - A random salt is generated for contract address
 * - The function waits for transaction confirmation
 * - Owner address must be a valid Starknet address
 * - Name and symbol should follow token naming conventions
 */
export const createMemecoin = async (
  params: CreateMemecoinParams,
  privateKey: string
) => {
  try {
    const salt = stark.randomAddress();
    const { transaction_hash } = await execute(
      Entrypoint.CREATE_MEMECOIN,
      process.env.PUBLIC_ADDRESS,
      privateKey,
      [
        params.owner,
        params.name,
        params.symbol,
        uint256.bnToUint256(
          BigInt(params.initialSupply) * BigInt(decimalsScale(DECIMALS))
        ),
        salt,
      ]
    );

    await rpcProvider.waitForTransaction(transaction_hash);

    return JSON.stringify({
      status: 'success',
      transactionHash: transaction_hash,
    });
  } catch (error) {
    console.error('Error creating memecoin:', error);
    return {
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};
