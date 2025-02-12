import { RpcProvider } from 'starknet';
import { StarknetAgentInterface } from 'src/lib/agent/tools/tools';
import { argentx_classhash } from '../constant/contract';
import { AccountManager } from '../utils/AccountManager';
import { AccountDetails } from '../../core/account/types/accounts';
import { z } from 'zod';
import { accountDetailsSchema } from '../schemas/schema';
  
export const DeployAXAccount = async (
    agent: StarknetAgentInterface,
    params: z.infer<typeof accountDetailsSchema>
  ) => {
    try {
        const provider = agent.getProvider();
        
        const accountManager = new AccountManager(provider);
        const tx = await accountManager.deployAccount(argentx_classhash, params);

        console.log('✅ AX wallet deployed at:', tx.contractAddress);
        console.log('✅ Transaction hash:', tx.transactionHash);

        return JSON.stringify({
            status: 'success',
            wallet: 'AX',
            transaction_hash: tx.transactionHash,
            contract_address: tx.contractAddress,
        });
    } catch (error) {
        return JSON.stringify({
            status: 'failure',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};
  
export const DeployAXAccountSignature = async (
    params: z.infer<typeof accountDetailsSchema>
  ) => {
    try {
        const provider = new RpcProvider({ nodeUrl: process.env.STARKNET_RPC_URL });
        
        const accountManager = new AccountManager(provider);
        const tx = await accountManager.deployAccount(argentx_classhash, params);

        console.log('✅ AX wallet deployed at:', tx.contractAddress);
        console.log('✅ Transaction hash:', tx.transactionHash);

        return JSON.stringify({
            status: 'success',
            wallet: 'AX',
            transaction_hash: tx.transactionHash,
            contract_address: tx.contractAddress,
        });
    } catch (error) {
        return JSON.stringify({
            status: 'failure',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
  };
