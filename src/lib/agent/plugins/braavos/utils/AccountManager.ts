import {
  Account,
  CallData,
  stark,
  hash,
  ec,
  constants,
} from 'starknet';
import {
  AccountDetails,
  BaseUtilityClass,
  TransactionResult,
} from '../../core/account/types/accounts';

export class AccountManager implements BaseUtilityClass {
  constructor(
    public provider: any,
    public initialClasshash: string,
    public proxyClasshash: string,
    public accountClasshash: string
  ) {}

  private getConstructorCalldata(publicKey: string) {
    return CallData.compile(this.getConstructorRawdata(publicKey));
  }

  private getConstructorRawdata(publicKey: string) {
    const initializer = CallData.compile({ publicKey });
    return {
        implementation_address: this.initialClasshash,
        initializer_selector: hash.getSelectorFromName('initializer'),
        calldata: [...initializer]
    };
  }

  async createAccount(): Promise<AccountDetails> {
    try {
      const privateKey = stark.randomAddress();
      const publicKey = ec.starkCurve.getStarkKey(privateKey);

      const constructorCalldata = this.getConstructorCalldata(publicKey);
      const contractAddress = hash.calculateContractAddressFromHash(
        publicKey,
        this.proxyClasshash,
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

  private async getInvocation(accountDetails: AccountDetails) {
    const chainId = await this.provider.getChainId();
    const txHashForEstimate = hash.calculateDeployAccountTransactionHash({
        contractAddress: BigInt(accountDetails.contractAddress),
        classHash: BigInt(this.proxyClasshash),
        constructorCalldata: this.getConstructorCalldata(accountDetails.publicKey),
        salt: BigInt(accountDetails.publicKey),
        version: constants.TRANSACTION_VERSION.V2,
        maxFee: BigInt(constants.ZERO),
        chainId: chainId,
        nonce: BigInt(constants.ZERO)
    });

    const parsedOtherSigner = [0, 0, 0, 0, 0, 0, 0];
    const { r, s } = ec.starkCurve.sign(
        hash.computeHashOnElements([
          txHashForEstimate, 
          this.accountClasshash, 
          ...parsedOtherSigner
        ]),
        accountDetails.privateKey
    );

    const signatureForEstimate = [
        r.toString(),
        s.toString(),
        this.accountClasshash.toString(),
        ...parsedOtherSigner.map(e => e.toString())
    ];

    console.log('signatureForEstimate', signatureForEstimate);
    console.log("Try1");
    console.log('Try to convert: ', BigInt(accountDetails.publicKey));
    console.log("Try2");
    return { 
      classHash: this.proxyClasshash,
      constructorCalldata: this.getConstructorRawdata(accountDetails.publicKey),
      addressSalt: BigInt(accountDetails.publicKey), //bigNumberish ?
      signature: signatureForEstimate || [],
     }
  }

  async deployAccount(
    accountDetails: AccountDetails,
  ): Promise<TransactionResult> {
    try {
      const invocation = await this.getInvocation(accountDetails);
      const details = {
        nonce: constants.ZERO,
        version: constants.TRANSACTION_VERSION.V3
      }
      
      const { transaction_hash, contract_address } = await this.provider.deployAccountContract(invocation, details);
      await this.provider.waitForTransaction(transaction_hash);

      return {
        status: 'success',
        transactionHash: transaction_hash,
        contractAddress: contract_address,
      };
    } catch (error) {
      throw new Error(`Failed to create account: ${error.message}`);
    }
  }

  // async getAccountBalance(address: string): Promise<string> {
  //   try {
  //     const balance = await this.provider.getBalance(address);
  //     return balance.toString();
  //   } catch (error) {
  //     throw new Error(`Failed to get account balance: ${error.message}`);
  //   }
  // }

  // async getNonce(address: string): Promise<string> {
  //   try {
  //     const nonce = await this.provider.getNonceForAddress(address);
  //     return nonce.toString();
  //   } catch (error) {
  //     throw new Error(`Failed to get nonce: ${error.message}`);
  //   }
  // }

  // async isAccountDeployed(address: string): Promise<boolean> {
  //   try {
  //     const code = await this.provider.getClassAt(address);
  //     return code !== null;
  //   } catch (error) {
  //     return false;
  //   }
  // }

  async estimateAccountDeployFee(
    accountDetails: AccountDetails
  ) {
    try {
      const invocation = await this.getInvocation(accountDetails);
      const details = {
        nonce: constants.ZERO,
        version: constants.TRANSACTION_VERSION.V3
      }
      console.log('invocation', invocation);
      return await this.provider.getDeployAccountEstimateFee(invocation, details);
    } catch (error) {
      throw new Error(`Failed to estimate deploy fee: ${error.message}`);
    }
  }
}
