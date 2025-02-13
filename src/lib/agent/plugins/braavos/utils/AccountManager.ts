import {
    Account,
    CallData,
    stark,
    hash,
    ec,
    constants,
    RpcProvider,
    BigNumberish,
    DeployContractResponse,
    Calldata,
    num
  } from 'starknet';
  
  export interface AccountDetails {
    contractAddress: string;
    privateKey: string;
    publicKey: string;
  }
  
  export interface TransactionResult {
    status: 'success' | 'error';
    transactionHash: string;
    contractAddress?: string;
  }
  
  export class AccountManager {
    constructor(
      public provider: RpcProvider,
      public initialClassHash: string,
      public proxyClassHash: string,
      public accountClassHash: string
    ) {}
  
    private calcInit(publicKey: string): Calldata {
      return CallData.compile({ public_key: publicKey });
    }
  
    private getProxyConstructor(initializer: Calldata): Calldata {
      return CallData.compile({
        implementation_address: this.initialClassHash,
        initializer_selector: hash.getSelectorFromName('initializer'),
        calldata: [...initializer],
      });
    }
  
    async createAccount(): Promise<AccountDetails> {
      try {
        const privateKey = stark.randomAddress();
        const publicKey = ec.starkCurve.getStarkKey(privateKey);
  
        const initializer = this.calcInit(publicKey);
        const constructorCalldata = this.getProxyConstructor(initializer);
  
        const contractAddress = hash.calculateContractAddressFromHash(
          publicKey,
          this.proxyClassHash,
          constructorCalldata,
          0
        );
  
        return {
          contractAddress,
          privateKey,
          publicKey,
        };
      } catch (error) {
        throw new Error(`Failed to create account: ${error.message}`);
      }
    }
  
    private getBraavosSignature(
      contractAddress: BigNumberish,
      constructorCalldata: Calldata,
      publicKey: BigNumberish,
      version: bigint,
      maxFee: BigNumberish,
      chainId: constants.StarknetChainId,
      nonce: bigint,
      privateKey: BigNumberish
    ): string[] {
      const txHash = hash.calculateDeployAccountTransactionHash({
          contractAddress,
          classHash: this.proxyClassHash,
          constructorCalldata,
          salt:publicKey,
          version: "0x1",
          maxFee,
          chainId,
          nonce
      }
      );
  
      const parsedOtherSigner = [0, 0, 0, 0, 0, 0, 0];
      const { r, s } = ec.starkCurve.sign(
        hash.computeHashOnElements([txHash, this.accountClassHash, ...parsedOtherSigner]),
        num.toHex(privateKey)
      );
  
      return [
        r.toString(),
        s.toString(),
        this.accountClassHash.toString(),
        ...parsedOtherSigner.map((e) => e.toString()),
      ];
    }
  
    async estimateAccountDeployFee(
      accountDetails: AccountDetails
    ): Promise<bigint> {
      try {
        const version = "0x1";
        const nonce = constants.ZERO;
        const chainId = await this.provider.getChainId();
        
        const initializer = this.calcInit(accountDetails.publicKey);
        const constructorCalldata = this.getProxyConstructor(initializer);
  
        const signature = this.getBraavosSignature(
          accountDetails.contractAddress,
          constructorCalldata,
          accountDetails.publicKey,
          BigInt(version),
          constants.ZERO,
          chainId,
          BigInt(nonce),
          accountDetails.privateKey
        );
  
        const deployAccountPayload = {
          classHash: this.proxyClassHash,
          constructorCalldata,
          addressSalt: accountDetails.publicKey,
          signature
        };
  
        const response = await this.provider.getDeployAccountEstimateFee(
          deployAccountPayload,
          { version, nonce }
        );
  
        return stark.estimatedFeeToMaxFee(response.overall_fee);
      } catch (error) {
        throw new Error(`Failed to estimate deploy fee: ${error.message}`);
      }
    }
  
    async deployAccount(
      accountDetails: AccountDetails,
      maxFee?: BigNumberish
    ): Promise<TransactionResult> {
      try {
        const version = "0x1";
        const nonce = constants.ZERO;
        const chainId = await this.provider.getChainId();
  
        const initializer = this.calcInit(accountDetails.publicKey);
        const constructorCalldata = this.getProxyConstructor(initializer);
  
        maxFee = maxFee ?? await this.estimateAccountDeployFee(accountDetails);
  
        const signature = this.getBraavosSignature(
          accountDetails.contractAddress,
          constructorCalldata,
          accountDetails.publicKey,
          BigInt(version),
          maxFee,
          chainId,
          BigInt(nonce),
          accountDetails.privateKey
        );
  
        const { transaction_hash, contract_address } = await this.provider.deployAccountContract(
          {
            classHash: this.proxyClassHash,
            constructorCalldata,
            addressSalt: accountDetails.publicKey,
            signature,
          },
          {
            nonce,
            maxFee,
            version,
          }
        );
  
        await this.provider.waitForTransaction(transaction_hash);
  
        return {
          status: 'success',
          transactionHash: transaction_hash,
          contractAddress: contract_address,
        };
      } catch (error) {
        throw new Error(`Failed to deploy account: ${error.message}`);
      }
    }
  }