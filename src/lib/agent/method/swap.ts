import { Account } from 'starknet';
import { executeSwap, fetchQuotes, QuoteRequest } from '@avnu/avnu-sdk';
import { AVNU_TOKEN_LIST, tokenAddresses } from 'src/lib/constant';
import { StarknetAgent } from '../starknetAgent';

export type SwapParams = {
  sellTokenSymbol: string;
  buyTokenSymbol: string;
  sellAmount: number;
};

interface IAvnuToken {
  name: string;
  address: string;
  symbol: string;
  decimals: number;
  logoUri: string | null;
  lastDailyVolumeUsd: number;
  extensions: {
    coingeckoId: number;
  };
  tags: string[];
}

interface IAvnuResponse {
  content: IAvnuToken[];
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

export const swapTokens = async (params: SwapParams, privateKey: string) => {
  try {
    const walletAddress = process.env.PUBLIC_ADDRESS;
    if (!walletAddress) {
      throw new Error('Wallet address not configured');
    }

    const agent = new StarknetAgent({
      walletPrivateKey: privateKey,
      aiProviderApiKey: process.env.AI_PROVIDER_API_KEY,
      aiModel: process.env.AI_MODEL,
    });

    // Create account instance
    const account = new Account(
      agent.contractInteractor.provider,
      walletAddress,
      privateKey
    );
    params.sellTokenSymbol = params.sellTokenSymbol.toLowerCase();
    params.buyTokenSymbol = params.buyTokenSymbol.toLowerCase();

    const tokenList = await fetch(AVNU_TOKEN_LIST);

    const list: IAvnuResponse = await tokenList.json();

    let sellTokenAddress = undefined;
    let buyTokenAddress = undefined;
    let formattedAmount;
    for (const token of list.content) {
      const symbol = token.symbol.toLowerCase();

      if (symbol === params.sellTokenSymbol) {
        sellTokenAddress = token.address;
        // Format sell amount with correct decimals
        formattedAmount = BigInt(
          agent.contractInteractor.formatTokenAmount(
            params.sellAmount.toString(),
            token.decimals
          )
        );
      }

      if (symbol === params.buyTokenSymbol) {
        buyTokenAddress = token.address;
      }

      if (buyTokenAddress && sellTokenAddress) {
        break;
      }
    }

    if (!sellTokenAddress) {
      throw new Error(`Sell token ${params.sellTokenSymbol} not supported`);
    }

    if (!buyTokenAddress) {
      throw new Error(`Buy token ${params.buyTokenSymbol} not supported`);
    }

    // Prepare quote request
    const quoteParams: QuoteRequest = {
      sellTokenAddress,
      buyTokenAddress,
      sellAmount: formattedAmount,
      takerAddress: account.address,
      size: 1,
    };

    // Fetch quotes
    const quotes = await fetchQuotes(quoteParams);
    if (!quotes || quotes.length === 0) {
      throw new Error('No quotes available for this swap');
    }

    // Execute the swap
    const swapResult = await executeSwap(account, quotes[0], {
      slippage: 0.1,
    });

    // Monitor the swap transaction
    const receipt = await agent.transactionMonitor.waitForTransaction(
      swapResult.transactionHash,
      (status) => console.log('Swap status:', status)
    );

    // Get swap events
    const events = await agent.transactionMonitor.getTransactionEvents(
      swapResult.transactionHash
    );

    // Parse amount received from events if available
    const amountReceived = null;
    if (events && events.length > 0) {
      // Here you would parse the relevant event to get the amount received
      // The exact parsing logic depends on the event structure
    }

    return JSON.stringify({
      status: 'success',
      message: `Successfully swapped ${params.sellAmount} ${params.sellTokenSymbol} for ${params.buyTokenSymbol}`,
      transactionHash: swapResult.transactionHash,
      sellAmount: params.sellAmount,
      sellToken: params.sellTokenSymbol,
      buyToken: params.buyTokenSymbol,
      amountReceived,
      receipt,
      events,
    });
  } catch (error) {
    console.error('Swap error:', error);
    return JSON.stringify({
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
      step: 'swap execution',
    });
  }
};

// Helper function to monitor swap status
const monitorSwapStatus = async (agent: StarknetAgent, txHash: string) => {
  try {
    const receipt = await agent.transactionMonitor.waitForTransaction(txHash);
    const events = await agent.transactionMonitor.getTransactionEvents(txHash);
    return { receipt, events };
  } catch (error) {
    throw new Error(`Failed to monitor swap status: ${error.message}`);
  }
};

// Helper function to validate and get token addresses
const validateTokens = (sellSymbol: string, buySymbol: string) => {
  const sellTokenAddress = tokenAddresses[sellSymbol];
  const buyTokenAddress = tokenAddresses[buySymbol];

  if (!sellTokenAddress || !buyTokenAddress) {
    throw new Error('Invalid token symbols');
  }

  return { sellTokenAddress, buyTokenAddress };
};

// Helper function to check token allowance and approve if needed
const checkAndApproveToken = async (
  agent: StarknetAgent,
  account: Account,
  tokenAddress: string,
  spenderAddress: string,
  amount: string
) => {
  const erc20Abi = [
    {
      name: 'allowance',
      type: 'function',
      inputs: [
        { name: 'owner', type: 'felt' },
        { name: 'spender', type: 'felt' },
      ],
      outputs: [{ name: 'remaining', type: 'Uint256' }],
      stateMutability: 'view',
    },
    {
      name: 'approve',
      type: 'function',
      inputs: [
        { name: 'spender', type: 'felt' },
        { name: 'amount', type: 'Uint256' },
      ],
      outputs: [{ name: 'success', type: 'felt' }],
      stateMutability: 'external',
    },
  ];

  const contract = agent.contractInteractor.createContract(
    erc20Abi,
    tokenAddress,
    account
  );

  // Check current allowance
  const allowance = await agent.contractInteractor.readContract(
    contract,
    'allowance',
    [account.address, spenderAddress]
  );

  if (BigInt(allowance.remaining.toString()) < BigInt(amount)) {
    // Approve if needed
    const result = await agent.contractInteractor.writeContract(
      contract,
      'approve',
      [spenderAddress, amount]
    );

    if (result.status === 'success' && result.transactionHash) {
      await agent.transactionMonitor.waitForTransaction(result.transactionHash);
    } else {
      throw new Error('Failed to approve token');
    }
  }
};
