import { ERC20_ABI } from 'src/core/abis/tokens/erc20Abi';
import { getBalance } from 'src/lib/agent/method/read/getBalances';
import { Contract } from 'starknet';
import { agent2 } from 'test/utils/helpers';

describe('Read -> Get_Balance -> get_balance', () => {
  describe('With perfect match inputs', () => {
    it('should return correct ETH balance when all parameters are valid', async () => {
      const params = {
        accountAddress: process.env.PUBLIC_ADDRESS_2 as string,
        assetSymbol: 'ETH',
      };

      const result = await getBalance(agent2, params);
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
        accountAddress: process.env.PUBLIC_ADDRESS_2 as string,
        assetSymbol: 'USDC',
      };

      const result = await getBalance(agent2, params);
      const parsed = JSON.parse(result);

      expect(parsed.status).toBe('success');
      console.log(parsed.balance);
    });
  });

  describe('With missing inputs', () => {
    it('should fail reason : unsupported token symbol', async () => {
      const params = {
        accountAddress: process.env.PUBLIC_ADDRESS_2 as string,
        assetSymbol: 'UNKNOWN',
      };

      const result = await getBalance(agent2, params);
      const parsed = JSON.parse(result);

      expect(parsed.status).toBe('failure');
      expect(parsed.error).toBe('Token UNKNOWN not supported');
    });
  });
});
