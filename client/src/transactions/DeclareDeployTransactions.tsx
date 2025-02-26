import { NewContractResponse } from '@/interfaces/starknetagents';
import { WalletAccount, extractContractHashes, DeclareContractPayload, CompiledSierra, CompiledSierraCasm } from 'starknet';


export const handleDeclareDeployTransactions = async (
  Wallet: WalletAccount,
  response: NewContractResponse
): Promise<string> => {
  try {
    if (!response.results || response.results.length === 0) {
      throw new Error('Invalid DECLARE_AND_DEPLOY response format');
    }

    const result = response.results[0];
    
    if (result.status !== 'success') {
      throw new Error('Declare and deploy transaction preparation failed');
    }

    const { contractClass, classHash, compiledClassHash, constructorCalldata } = result.transactions;
    
    // Validation des données
    if (!contractClass || !constructorCalldata) {
      throw new Error('Missing contract class or constructor calldata');
    }

    const fetchSierraContract = async () => {
      const response = await fetch('/contract/test_EmptyContract.contract_class.json');
      const data = await response.text();
      return data;
    };
    
    const fetchCasmContract = async () => {
      const response = await fetch('/contract/test_EmptyContract.compiled_contract_class.json');
      const textData = await response.text();
      const cleanedData = textData.trim().replace(/^\uFEFF/, '');
      
      return JSON.parse(cleanedData);
    };
    
    const compiledTestSierra = await fetchSierraContract();
    const compiledTestCasm = await fetchCasmContract();

    const payload = {
      contract: contractClass,
      classHash: classHash,
      casm: compiledTestCasm,
      compiledClassHash: compiledClassHash
    }
    console.log("EXTRACTING HASHES");
    const res = extractContractHashes(payload as DeclareContractPayload);
    console.log('Extracted hashes:', res);

    console.log("Declaring contract...");
    const declareResponse = await Wallet.declareIfNot(payload as DeclareContractPayload);
    
    console.log("Declaration submitted. Class Hash: " + declareResponse.class_hash);

    const deployResponse = await Wallet.deployContract({
      classHash: declareResponse.class_hash,
      constructorCalldata: []
    });

    console.log('Deploy response:', deployResponse);
    if (!deployResponse) {
      throw new Error(
        'Account not deployed'
      );
    }

    console.log('Deploy response:', deployResponse);
    console.log("address : ", deployResponse.contract_address);
    return JSON.stringify({
      status: 'success',
      message: 'Contract successfully declared and deployed',
      transactionHash: deployResponse.transaction_hash,
      contractAddress: deployResponse.contract_address,
      // contract: deployResponse.contract_console.less
    });
  } catch (error) {
    console.error('Declare and deploy error:', error);
    return JSON.stringify({
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error during declare and deploy'
    });
  }
};