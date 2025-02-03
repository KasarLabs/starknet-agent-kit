import { Account, CallData, stark, hash, ec, RpcProvider } from 'starknet';
import {
  AccountDetails,
  BaseUtilityClass,
  TransactionResult,
} from '../types/accounts';
import { getDefaultProvider } from 'ethers';

export class AccountManager implements BaseUtilityClass {
  constructor(public provider: any) {}

  async createAccount(): Promise<AccountDetails> {
    try {
      const privateKey = stark.randomAddress();
      const publicKey = ec.starkCurve.getStarkKey(privateKey);
      const accountClassHash =
        '0x061dac032f228abef9c6626f995015233097ae253a7f72d68552db02f2971b8f';
      const constructorCallData = CallData.compile({ publicKey });
      const address = hash.calculateContractAddressFromHash(
        publicKey,
        accountClassHash,
        constructorCallData,
        0
      );

      return {
        address,
        privateKey,
        publicKey,
        deployStatus: false,
      };
    } catch (error) {
      throw new Error(`Failed to create account: ${error.message}`);
    }
  }

  async deployAccount(
    accountDetails: AccountDetails
  ): Promise<TransactionResult> {
    try {
      const account = new Account(
        this.provider,
        accountDetails.address,
        accountDetails.privateKey
      );

      const accountClassHash =
        '0x061dac032f228abef9c6626f995015233097ae253a7f72d68552db02f2971b8f';
      const constructorCallData = CallData.compile({
        publicKey: accountDetails.publicKey,
      });

      const { transaction_hash } = await account.deployAccount({
        classHash: accountClassHash,
        constructorCalldata: constructorCallData,
        addressSalt: accountDetails.publicKey,
      });

      await this.provider.waitForTransaction(transaction_hash);

      return {
        status: 'success',
        transactionHash: transaction_hash,
      };
    } catch (error) {
      return {
        status: 'failure',
        error: error.message,
      };
    }
  }

  async getAccountBalance(address: string): Promise<string> {
    try {
      const balance = await this.provider.getBalance(address);
      return balance.toString();
    } catch (error) {
      throw new Error(`Failed to get account balance: ${error.message}`);
    }
  }

  async getNonce(address: string): Promise<string> {
    try {
      const nonce = await this.provider.getNonceForAddress(address);
      return nonce.toString();
    } catch (error) {
      throw new Error(`Failed to get nonce: ${error.message}`);
    }
  }

  async isAccountDeployed(address: string): Promise<boolean> {
    try {
      const code = await this.provider.getClassAt(address);
      return code !== null;
    } catch (error) {
      return false;
    }
  }

  async estimateAccountDeployFee(accountDetails: AccountDetails) {
    try {
      const account = new Account(
        this.provider,
        accountDetails.address,
        accountDetails.privateKey
      );

      const accountClassHash =
        '0x061dac032f228abef9c6626f995015233097ae253a7f72d68552db02f2971b8f';
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
