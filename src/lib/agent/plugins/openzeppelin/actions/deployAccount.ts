import { Account, CallData, RpcProvider } from 'starknet';
import { StarknetAgentInterface } from 'src/lib/agent/tools/tools';
import { oz_classhash } from '../constant/contract';
import { DeployOZAccountParams } from '../types/deployAccountTypes';
  
export const DeployOZAccount = async (
    agent: StarknetAgentInterface,
    params: DeployOZAccountParams
  ) => {
    try {
      const provider = agent.getProvider();
      const OZaccountConstructorCallData = CallData.compile({
        publicKey: params.publicKey,
      });
  
      let OZaccount = new Account(provider, params.precalculate_address, params.privateKey, undefined, "0x3");
      const deployAccountPayload = {
        classHash: oz_classhash,
        constructorCalldata: OZaccountConstructorCallData,
        addressSalt: params.publicKey,
        contractAddress: params.precalculate_address,
      };
      console.log("HERE1");
      const transaction = await OZaccount.deployAccount(deployAccountPayload);
      console.log(
        '✅ Open Zeppelin wallet deployed at:',
        transaction.contract_address,
        ' : ',
        transaction.transaction_hash
      );
      return {
        status: 'success',
        wallet: 'OpenZeppelin',
        transaction_hash: transaction.transaction_hash,
      };
    } catch (error) {
      return {
        status: 'failure',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  };
  

export const DeployOZAccountSignature = async (
    params: DeployOZAccountParams
  ) => {
    try {
      const provider = new RpcProvider({ nodeUrl: process.env.STARKNET_RPC_URL });
      const OZaccountConstructorCallData = CallData.compile({
        publicKey: params.publicKey,
      });
  
      
      let OZaccount = new Account(provider, params.precalculate_address, params.privateKey, undefined, "0x3");
      console.log(`Account address : ${OZaccount.address}`);
      const deployAccountPayload = {
        classHash: oz_classhash,
        constructorCalldata: OZaccountConstructorCallData,
        addressSalt: params.publicKey
      };
      console.log("HERE1");
      const transaction = await OZaccount.deployAccount(deployAccountPayload);
      console.log(
        '✅ Open Zeppelin wallet deployed at:',
        transaction.contract_address,
        ' : ',
        transaction.transaction_hash
      );
      return JSON.stringify({
        status: 'success',
        wallet: 'OpenZeppelin',
        transaction_hash: transaction.transaction_hash,
        contract_address: transaction.contract_address,
      });
    } catch (error) {
      return {
        status: 'failure',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  };
