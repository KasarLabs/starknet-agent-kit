import {
  Account,
  CallData,
  stark,
  hash,
  ec,
  RpcProvider,
  CairoOption,
  CairoOptionVariant,
  CairoCustomEnum,
} from 'starknet';
import {
  AccountDetails,
  BaseUtilityClass,
  TransactionResult,
} from '../types/accounts';
import { getDefaultProvider } from 'ethers';

export class AccountManager implements BaseUtilityClass {
  constructor(public provider: any) {}

  async createAccount(accountClassHash: string): Promise<AccountDetails> {
    try {
      const privateKey = stark.randomAddress();
      const publicKey = ec.starkCurve.getStarkKey(privateKey);

      const constructorCallData = CallData.compile({ publicKey });
      const contractAddress = hash.calculateContractAddressFromHash(
        publicKey,
        accountClassHash,
        constructorCallData,
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

  async deployAccount(
    accountClassHash: string,
    accountDetails: AccountDetails
  ): Promise<TransactionResult> {
    try {
      const account = new Account(
        this.provider,
        accountDetails.contractAddress,
        accountDetails.privateKey
      );

      const constructorCallData = CallData.compile({
        publicKey: accountDetails.publicKey,
      });

      const { transaction_hash, contract_address } =
        await account.deployAccount({
          classHash: accountClassHash,
          constructorCalldata: constructorCallData,
          addressSalt: accountDetails.publicKey,
        });

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
    accountClassHash: string,
    accountDetails: AccountDetails
  ) {
    try {
      const account = new Account(
        this.provider,
        accountDetails.contractAddress,
        accountDetails.privateKey
      );

      const constructorCallData = CallData.compile({
        publicKey: accountDetails.publicKey,
      });

      return await account.estimateAccountDeployFee({
        classHash: accountClassHash,
        constructorCalldata: constructorCallData,
        addressSalt: accountDetails.publicKey,
      });
    } catch (error) {
      throw new Error(`Failed to estimate deploy fee: ${error.message}`);
    }
  }
}
