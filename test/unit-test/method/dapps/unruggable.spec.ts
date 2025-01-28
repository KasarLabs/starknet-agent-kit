import { Contract, RpcProvider } from 'starknet';
import { createMemecoin } from 'src/lib/agent/method/dapps/degen/unruggable/method/createMemecoin';
import { isMemecoin } from 'src/lib/agent/method/dapps/degen/unruggable/method/isMemecoin';
import { launchOnEkubo } from 'src/lib/agent/method/dapps/degen/unruggable/method/launchOnEkubo';
import { getLockedLiquidity } from 'src/lib/agent/method/dapps/degen/unruggable/method/getLockedLiquidity';
import { StarknetAgent } from 'src/lib/agent/starknetAgent';
import { globalAgent } from 'test/utils/helpers';

describe('Unruggable Factory Methods', () => {



  // Test data that matches schema definitions
  const mockData = {
    memecoin: {
      owner: "0x040f0EFbD00fa8AcBE0fD3E57D282A0202a208aE208377e8eb6ba774740ff987",
      name: "Test Token",
      symbol: "TEST",
      initialSupply: "1000000",
    },
    ekubo: {
      launchParams: {
        memecoinAddress: "0x456abc...",
        transferRestrictionDelay: 86400,
        maxPercentageBuyLaunch: 5,
        quoteAddress: "0x789def...",
        initialHolders: ["0x012..."],
        initialHoldersAmounts: ["1000000000000000000"]
      },
      ekuboParams: {
        fee: "3000",
        tickSpacing: "60",
        startingPrice: {
          mag: "1000000000000000000",
          sign: true
        },
        bound: "500000"
      }
    }
  };

 

 

  describe('createMemecoin', () => {
    it('should successfully create a memecoin and return transaction hash', async () => {
        const result = await createMemecoin(globalAgent, mockData.memecoin);
      const parsedResult = JSON.parse(typeof result === 'string' ? result : '{}');
      expect(parsedResult.status).toBe('success');
    });

    it('should handle contract deployment failures', async () => {
    mockData.memecoin.initialSupply = "-5";
      const result = await createMemecoin(globalAgent, mockData.memecoin);
      const parsedResult = JSON.parse(result);

      expect(parsedResult.status).toBe('failure');

    });
  });

  describe('isMemecoin', () => {
    it('should correctly identify a valid memecoin', async () => {
      const result = await isMemecoin(globalAgent, {
        contractAddress: "0x07f98f2fb14e5fa864ed487ca28945a0804616e510d9f7c0aaa036db80b9a575"
      });

      const parsedResult = JSON.parse(result);
      expect(parsedResult.status).toBe('success');
      expect(parsedResult.isMemecoin).toBe(true);
    });

    it('should correctly identify a non valid memecoin', async () => {
      const result = await isMemecoin(globalAgent, {
        contractAddress: "0x040f0EFbD00fa8AcBE0fD3E57D282A0202a208aE208377e8eb6ba774740ff987"
      });

      const parsedResult = JSON.parse(result);
      expect(parsedResult.status).toBe('success');
      expect(parsedResult.isMemecoin).toBe(false);
    });
  });

  /*describe('getLockedLiquidity', () => {
    it('should return Ekubo NFT liquidity information', async () => {
      const result = await getLockedLiquidity(agent, {
        contractAddress: "0x07f98f2fb14e5fa864ed487ca28945a0804616e510d9f7c0aaa036db80b9a575"
      });
      const parsedResult = JSON.parse(result);

      expect(parsedResult.status).toBe('success');
      expect(parsedResult.data?.hasLockedLiquidity).toBe(true);
      expect(parsedResult.data?.liquidityType?.type).toBe('EkuboNFT');
    });

    it('should handle case with no locked liquidity', async () => {
      jest.spyOn(Contract.prototype, 'locked_liquidity').mockResolvedValueOnce([]);

      const result = await getLockedLiquidity(agent, {
        contractAddress: "0x07f98f2fb14e5fa864ed487ca28945a0804616e510d9f7c0aaa036db80b9a575"
      });
      const parsedResult = JSON.parse(result);


      expect(parsedResult.status).toBe('success');
      expect(parsedResult.data?.hasLockedLiquidity).toBe(false);
      expect(parsedResult.data?.liquidityType).toBeUndefined();
    });

    it('should handle contract errors', async () => {
      jest.spyOn(Contract.prototype, 'locked_liquidity')
        .mockRejectedValueOnce(new Error('Failed to fetch liquidity'));

      const result = await getLockedLiquidity(agent, {
        contractAddress: "0x040f0EFbD00fa8AcBE0fD3E57D282A0202a208aE208377e8eb6ba774740ff987"
      });
      const parsedResult = JSON.parse(result);

      expect(parsedResult.status).toBe('failure');
    });
  });

  describe('launchOnEkubo', () => {
    it('should successfully launch token on Ekubo', async () => {
      const result = await launchOnEkubo(agent, mockData.ekubo);

      const parsedResult = JSON.parse(result);
      expect(parsedResult.status).toBe('success');
      expect(parsedResult.response.token_id).toBe('1');
      expect(parsedResult.response.lp_info).toBeDefined();
    });

    it('should handle launch failures', async () => {
      jest.spyOn(Contract.prototype, 'launch_on_ekubo')
        .mockRejectedValueOnce(new Error('Launch failed'));

      const result = await launchOnEkubo(agent, mockData.ekubo);

      const parsedResult = JSON.parse(result);
      expect(parsedResult.status).toBe('failed');
      expect(parsedResult.error).toBe('Launch failed');
    });

    it('should validate launch parameters against schema', async () => {
      const invalidEkuboParams = {
        ...mockData.ekubo,
        ekuboParams: {
          ...mockData.ekubo.ekuboParams,
          fee: "30000" // Invalid fee (too high)
        }
      };

      const result = await launchOnEkubo(agent, invalidEkuboParams);

      const parsedResult = JSON.parse(result);
      expect(parsedResult.status).toBe('failed');
      expect(parsedResult.error).toBeDefined();
    });
  });*/
});