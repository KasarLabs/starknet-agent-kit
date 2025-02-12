import { Account, CallData, RpcProvider } from 'starknet';
import { StarknetAgentInterface } from 'src/lib/agent/tools/tools';
import { okx_classhash } from '../constant/contract';
import { DeployOKXParams } from '../types/deployAccountTypes';

export const DeployOKXAccount = async (
    agent: StarknetAgentInterface,
    params: DeployOKXParams
) => {
    try {
        const provider = agent.getProvider();
        const OKXaccountConstructorCallData = CallData.compile({
        publicKey: params.publicKey,
        });
        
        const OKXaccount = new Account(
        provider,
        params.precalculate_address,
        params.privateKey
        );

        const transaction = await OKXaccount.deployAccount({
        classHash: okx_classhash,
        constructorCalldata: OKXaccountConstructorCallData,
        addressSalt: params.publicKey,
        });
        
        console.log(
        '✅ OKX wallet deployed at:',
        transaction.contract_address,
        ' : ',
        transaction.transaction_hash
        );
        
        return {
        status: 'success',
        wallet: 'OKX',
        transaction_hash: transaction.transaction_hash,
        contract_address: transaction.contract_address
        };
    } catch (error) {
        return {
        status: 'failure',
        error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
};

export const DeployOKXAccountSignature = async (
    params: DeployOKXParams
) => {
    try {
        const provider = new RpcProvider({ nodeUrl: process.env.STARKNET_RPC_URL });
        const OKXaccountConstructorCallData = CallData.compile({
        publicKey: params.publicKey,
        });
        
        const OKXaccount = new Account(
        provider,
        params.precalculate_address,
        params.privateKey
        );

        const suggestedMaxFee = await OKXaccount.estimateAccountDeployFee({
        classHash: okx_classhash,
        constructorCalldata: OKXaccountConstructorCallData,
        contractAddress: params.precalculate_address,
        });

        const transaction = await OKXaccount.deployAccount({
        classHash: okx_classhash,
        constructorCalldata: OKXaccountConstructorCallData,
        addressSalt: params.publicKey,
        }, {
        maxFee: suggestedMaxFee.suggestedMaxFee.toString()
        });
        
        console.log(
        '✅ OKX wallet with signature deployed at:',
        transaction.contract_address,
        ' : ',
        transaction.transaction_hash
        );
        
        return JSON.stringify({
        status: 'success',
        wallet: 'OKX',
        transaction_hash: transaction.transaction_hash,
        contract_address: transaction.contract_address,
        });
    } catch (error) {
        return JSON.stringify({
        status: 'failure',
        error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};
