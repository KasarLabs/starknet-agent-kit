import { Account, Contract, CallData, hash } from 'starknet';
import { StarknetAgentInterface } from 'src/lib/agent/tools/tools';
import { declareDeployERC721Schema } from '../schemas/schema';
import fs from 'fs';
import { z } from 'zod';

/**
 * Declares a new contract on Starknet
 * @param {DeclareDeployERC721Params} params - Contract declaration parameters
 * @param {StarknetAgentInterface} agent - Starknet agent interface
 * @returns {Promise<string>} JSON string with transaction result or error
 */
export const declareAndDeployERC721Contract = async (
    agent: StarknetAgentInterface,
    params: z.infer<typeof declareDeployERC721Schema>
) => {
  try {
    const provider = agent.getProvider();
    const accountCredentials = agent.getAccountCredentials();
    const accountAddress = accountCredentials?.accountPublicKey;
    const accountPrivateKey = accountCredentials?.accountPrivateKey;
    const totalSupply = params.totalSupply;

    if (!accountAddress) {
      throw new Error('Account address not configured');
    }

    const account = new Account(
        provider, 
        accountAddress, 
        accountPrivateKey
    );

      const filePath = 'src/lib/agent/plugins/erc721/contract/test_EmptyContract.contract_class.json';
      console.log("Tentative de lecture du fichier:", filePath);
      const fileContent = fs.readFileSync(filePath).toString('ascii');
      console.log("Contenu lu, taille:", fileContent.length);
      const compiledTestSierra = JSON.parse(fileContent);

    
    // const compiledTestSierra = JSON.parse(
    //     fs.readFileSync('src/lib/agent/plugins/erc721/contract/test_MyNFT.contract_class.json').toString('ascii')
    // );
    const compiledTestCasm = JSON.parse(
        fs.readFileSync('src/lib/agent/plugins/erc721/contract/test_MyNFT.compiled_contract_class.json').toString('ascii')
    );

    const contractCallData = new CallData(compiledTestSierra.abi);
    const constructorCalldata = contractCallData.compile('constructor', {
        owner: accountAddress,
        total_supply: totalSupply
    });
    
    const deployResponse = await account.declareAndDeploy({
        contract: compiledTestSierra,
        casm: compiledTestCasm,
        constructorCalldata: constructorCalldata
    });
    
    const myTestContract = new Contract(
        compiledTestSierra.abi,
        deployResponse.deploy.contract_address,
        provider
    );
    console.log('Test Contract Class Hash =', deployResponse.declare.class_hash);
    console.log('✅ Test Contract connected at =', myTestContract.address);

    return JSON.stringify({
      status: 'success',
      transactionHash: deployResponse.deploy.transaction_hash,
      classHash: deployResponse.declare.class_hash,
      contractAddress: myTestContract.address,
    });
  } catch (error) {
    console.log('Error:', error);
    return JSON.stringify({
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};


/**
 * Prépare les données de signature pour déclarer et déployer un contrat ERC721 sur Starknet
 * @param {z.infer<typeof declareDeployERC721Schema>} params - Paramètres de déclaration et déploiement du contrat
 * @returns {Promise<any>} Données formatées pour la signature
 */
export const declareAndDeployERC721Signature = async (
    params: z.infer<typeof declareDeployERC721Schema>
  ): Promise<any> => {
    try {
      console.log("DECLARE DEPLOY CONTRACT");
      if (!params?.totalSupply) {
        throw new Error('Le supply total est requis');
      }

      const totalSupply = params.totalSupply;
      

      const filePath = 'src/lib/agent/plugins/erc721/contract/test_EmptyContract.contract_class.json';
      console.log("Tentative de lecture du fichier:", filePath);
      const fileContent = fs.readFileSync(filePath).toString('ascii');
      console.log("Contenu lu, taille:", fileContent.length);
      const compiledTestSierra = JSON.parse(fileContent);
      // Lecture des fichiers de compilation
      // const compiledTestSierra = JSON.parse(
      //   fs.readFileSync('src/lib/agent/plugins/erc721/contract/test_EmptyContract.contract_class.json').toString('ascii')
      // );

      const compiledTestCasm = JSON.parse(
        fs.readFileSync('src/lib/agent/plugins/erc721/contract/test_EmptyContract.compiled_contract_class.json').toString('ascii')
    );
      
      // const contractCallData = new CallData(compiledTestSierra.abi);
      // const constructorCalldata = contractCallData.compile('constructor', {
      //   owner: "0x06889CE7127025749Ab8c2F63c4ba26f972b16530B9aCee3255e59055c0B8CFd", // Sera remplacé par l'adresse réelle lors de l'exécution
      // });
      
      const result = {
        status: 'success',
        transactions: {
          contractClass: compiledTestSierra,
          classHash: hash.computeContractClassHash(compiledTestSierra),
          compiledClassHash: hash.computeCompiledClassHash(compiledTestCasm),
          constructorCalldata: []
        },
      };
      console.log("result : ", result);
      
      return JSON.stringify({ 
        transaction_type: 'DECLARE_AND_DEPLOY', 
        results: [result] 
      });
    } catch (error) {
      return {
        status: 'error',
        error: {
          code: 'DECLARE_DEPLOY_SIGNATURE_ERROR',
          message: error.message || 'Échec de génération des données de signature pour declareAndDeploy',
        },
      };
    }
  };
