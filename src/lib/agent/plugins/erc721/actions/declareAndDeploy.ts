import { Account, Contract, CallData, hash, RpcProvider } from 'starknet';
import { StarknetAgentInterface } from 'src/lib/agent/tools/tools';
import { ContractManager } from '../utils/contractManager';
import { ERC721_SIERRA, ERC721_CASM } from '../constant/compiledFile';
import { declareDeployERC721Schema } from '../schemas/schema';
import { z } from 'zod';

export const declareAndDeployERC721Contract = async (
    agent: StarknetAgentInterface,
    params: z.infer<typeof declareDeployERC721Schema>
) => {
  try {
    const provider = agent.getProvider();
    const accountCredentials = agent.getAccountCredentials();
    const totalSupply = params.totalSupply;

    console.log('Total Supply =', totalSupply);
    const account = new Account(
        provider, 
        accountCredentials?.accountPublicKey,
        accountCredentials?.accountPrivateKey
    );

    const contractManager = new ContractManager(account);
    await contractManager.loadContractCompilationFiles(ERC721_SIERRA, ERC721_CASM);
    console.log("Contract Compilation Files Loaded Successfully");

    const { classHash } = await contractManager.declareContract();
    console.log('✅ Contract declared with class hash =', classHash);

    // const constructorParamsType = contractManager.extractConstructorParams();
    // console.log('Constructor Params Type =', constructorParamsType);

    const response = await contractManager.deployContract(classHash as string, {
        owner: accountCredentials?.accountPublicKey,
        total_supply: totalSupply,
    });

    const myTestContract = new Contract(
        contractManager.compiledSierra.abi,
        response.contractAddress as string,
        provider
    );

    console.log('✅ Test Contract deployed at =', myTestContract.address);

    return JSON.stringify({
      status: 'success',
      transactionHash: response.transactionHash,
      classHash: classHash,
      contractAddress: response.contractAddress,
    });
  } catch (error) {
    console.log('Error:', error);
    return JSON.stringify({
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};