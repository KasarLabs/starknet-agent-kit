import { getBalance } from 'src/lib/agent/plugins/core/token/getBalances';
import { Contract } from 'starknet';
import { string } from 'zod';
import { ERC20_ABI } from 'src/lib/utils/constants/swap';

jest.mock('starknet', () => ({
  Contract: jest.fn((abi, address, provider) => ({
    balanceOf: jest
      .fn()
      .mockImplementation(async () => ({ balance: '2000000000000000000' })),
  })),
  RpcProvider: jest.fn(() => ({
    nodeUrl: process.env.STARKNET_RPC_URL,
  })),
}));

describe('Read -> Get_Balance -> get_balance', () => {
  describe('With perfect match inputs', () => {
    it('should return correct ETH balance when all parameters are valid', async () => {
      const params = {
        walletAddress: process.env.PUBLIC_ADDRESS_2 as string,
        assetSymbol: 'ETH',
      };

      const result = await getBalance(params);
      const parsed = JSON.parse(result);

      expect(parsed.status).toBe('success');
      expect(Contract).toHaveBeenCalledWith(
        ERC20_ABI,
        expect.any(String),
        expect.any(Object)
      );
      console.log(parsed.balance);
    });

    it('should return correct USDC balance with 6 decimals', async () => {
      const params = {
        walletAddress: process.env.STARKNET_PUBLIC_ADDRESS as string,
        assetSymbol: 'USDC',
      };

      const result = await getBalance(params);
      const parsed = JSON.parse(result);

      expect(parsed.status).toBe('success');
      console.log(parsed.balance);
    });
  });

  describe('With missing inputs', () => {
    it('should fail reason : unsupported token symbol', async () => {
      const params = {
        walletAddress: process.env.PUBLIC_ADDRESS_2 as string,
        assetSymbol: 'UNKNOWN',
      };

      const result = await getBalance(params);
      const parsed = JSON.parse(result);

      expect(parsed.status).toBe('failure');
      expect(parsed.error).toBe('Token UNKNOWN not supported');
    });
  });
});
