
import { Account, CallData, RawArgs, RPC, num, hash } from 'starknet';
import {
    ContractDeployResult,
    ContractDeclareResult,
    ContractDeclareAndDeployResult
  } from '../types/types';
  import * as fs from 'fs';
import { getV3DetailsPayload } from './nft';
  
  export class ContractManager {
    compiledSierra: any = {};
    compiledCasm: any = {};

    constructor(public account: Account) {}

    async loadContractCompilationFiles(sierraPath: string, casmPath: string) {
      try {
        this.compiledSierra = JSON.parse(fs.readFileSync(sierraPath).toString('ascii'));
        this.compiledCasm = JSON.parse(fs.readFileSync(casmPath).toString('ascii'));
      } catch (error) {
        throw new Error(`Failed to load contract files: ${error.message}`);
      }
    }
    
    async isContractDeclared(): Promise<{isDeclared: boolean, classHash?: string}> {
        try {
            const contractHash = hash.computeContractClassHash(this.compiledSierra);
            await this.account.getClassByHash(contractHash);
            return { isDeclared: true, classHash: contractHash };
        } catch (error) {
            return { isDeclared: false };
        }
      }

    async declareContract(): Promise<ContractDeclareResult> {
      const { isDeclared, classHash } = await this.isContractDeclared();
      
      if (isDeclared && classHash) {
        console.log(`Contract already declared with class hash: ${classHash}`);
        return {
          transactionHash: "",
          classHash: classHash
        };
      }
      try {
        const declarePayload = {
            contract: this.compiledSierra,
            casm: this.compiledCasm
        }

        const declareResponse = await this.account.declareIfNot(declarePayload, getV3DetailsPayload());
        await this.account.waitForTransaction(declareResponse.transaction_hash);
        
        return {
          transactionHash: declareResponse.transaction_hash,
          classHash: declareResponse.class_hash
        };
    } catch (error) {
        throw new Error(`Failed to declare contract: ${error.message}`);
      }
    }
    
    async deployContract(
      classHash: string,
      constructorArgs: RawArgs = [],
    ): Promise<ContractDeployResult> {
      try {
        const contractCallData = new CallData(this.compiledSierra.abi);
        const constructorCalldata = contractCallData.compile('constructor', constructorArgs);
        
        const deployPayload = {
          classHash,
          constructorCalldata: constructorCalldata,
        };
        
        const deployResponse = await this.account.deployContract(deployPayload, getV3DetailsPayload());
        await this.account.waitForTransaction(deployResponse.transaction_hash);

        return {
          transactionHash: deployResponse.transaction_hash,
          contractAddress: deployResponse.contract_address
        };
      } catch (error) {
        throw new Error(`Failed to deploy contract: ${error.message}`);
      }
    }
    

    async declareAndDeployContract(constructorArgs: RawArgs = []): Promise<ContractDeclareAndDeployResult> {
        try {
            const contractCallData = new CallData(this.compiledSierra.abi);
            const constructorCalldata = contractCallData.compile('constructor', constructorArgs);

            const declareAndDeployPayload = {
                contract: this.compiledSierra,
                casm: this.compiledCasm,
                constructorCalldata: constructorCalldata,
            };

            const response = await this.account.declareAndDeploy(declareAndDeployPayload, getV3DetailsPayload());
            await this.account.waitForTransaction(response.deploy.transaction_hash);
            
            return {
                declare: {
                    transactionHash: response.declare.transaction_hash,
                    classHash: response.declare.class_hash.toString(),
                },
                deploy: {
                    transactionHash: response.deploy.transaction_hash,
                    contractAddress: response.deploy.contract_address
                },
            };
        } catch (error) {
            throw new Error(`Failed to declare and deploy contract: ${error.message}`);
        }
    }


    extractConstructorParams(): Array<{name: string, type: string}> {
        const constructorDef = this.compiledSierra.abi.find((item: { type: string }) => item.type === 'constructor');
        
        if (!constructorDef || !constructorDef.inputs || !Array.isArray(constructorDef.inputs)) {
            return [];
        }
        
        return constructorDef.inputs.map((input: { name: string, type: string }) => ({
            name: input.name,
            type: input.type
        }));
    }
}
