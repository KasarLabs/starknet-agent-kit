import { Account, Contract, RpcProvider, transaction } from 'starknet';
import { StarknetAgentInterface } from 'src/lib/agent/tools/tools';
import { GetBalanceParams, GetOwnBalanceParams } from '../types/balance';
import { ERC20_ABI } from '../abis/erc20Abi';
import { formatBalance, validateTokenAddress } from '../utils/token';

export const getOwnBalance = async (
  agent: StarknetAgentInterface,
  params: GetOwnBalanceParams
): Promise<string> => {
  try {
    if (!params?.symbol) {
      throw new Error('Symbol parameter is required');
    }

    const provider = agent.getProvider();
    const accountCredentials = agent.getAccountCredentials();

    const accountAddress = accountCredentials?.accountPublicKey;
    const accountPrivateKey = accountCredentials?.accountPrivateKey;

    if (!accountAddress) {
      throw new Error('Wallet address not configured');
    }

    const account = new Account(provider, accountAddress, accountPrivateKey);
    const tokenAddress = validateTokenAddress(params.symbol);
    const tokenContract = new Contract(ERC20_ABI, tokenAddress, provider);

    const balanceResponse = await tokenContract.balanceOf(account.address);

    const balanceValue = balanceResponse;

    if (balanceValue === undefined || balanceValue === null) {
      throw new Error('No balance value received from contract');
    }

    const formattedBalance = formatBalance(balanceValue, params.symbol);

    return JSON.stringify({
      status: 'success',
      balance: formattedBalance,
    });
  } catch (error) {
    return JSON.stringify({
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getBalance = async (
  agent: StarknetAgentInterface,
  params: GetBalanceParams
): Promise<string> => {
  try {
    if (!params?.assetSymbol || !params?.accountAddress) {
      console.log('params', params);
      throw new Error('Both asset symbol and account address are required');
    }

    const tokenAddress = validateTokenAddress(params.assetSymbol);
    console.log('tokenAddress', tokenAddress);
    
    const provider = agent.getProvider();
    const tokenContract = new Contract(ERC20_ABI, tokenAddress, provider);
    const balanceResponse = await tokenContract.balanceOf(
      params.accountAddress
    );

    console.log('balanceResponse', balanceResponse);
    if (!balanceResponse && typeof balanceResponse !== 'object') {
      console.log('here');
      throw new Error('Invalid balance response format from contract');
    }

    console.log(typeof balanceResponse);
    const balanceValue =
      typeof balanceResponse === 'object' && 'balance' in balanceResponse
        ? balanceResponse.balance
        : balanceResponse;

    const formattedBalance = formatBalance(balanceValue, params.assetSymbol);
    console.log('formattedBalance', formattedBalance);
    console.log(typeof formattedBalance);

    return JSON.stringify({
      status: 'success',
      balance: formattedBalance,
    });
  } catch (error) {
    console.log('Error in getBalance:', error);
    return JSON.stringify({
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getBalanceSignature = async (
  params: GetBalanceParams
): Promise<string> => {
  try {
    if (!params?.assetSymbol || !params?.accountAddress) {
      console.log('params', params);
      throw new Error('Both asset symbol and account address are required');
    }

    const provider = new RpcProvider({ nodeUrl: process.env.STARKNET_RPC_URL });

    const tokenAddress = validateTokenAddress(params.assetSymbol);
    const tokenContract = new Contract(ERC20_ABI, tokenAddress, provider);

    const balanceResponse = await tokenContract.balanceOf(
      params.accountAddress
    );

    if (!balanceResponse || typeof balanceResponse !== 'bigint') {
      throw new Error('Invalid balance response format from contract');
    }

    const formattedBalance = formatBalance(balanceResponse, params.assetSymbol);
    return JSON.stringify({
      status: 'success',
      transaction_type: 'READ',
      balance: formattedBalance,
    });
  } catch (error) {
    console.error('Error in getBalance:', error);
    return JSON.stringify({
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : undefined,
    });
  }
};
