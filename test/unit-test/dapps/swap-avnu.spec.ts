import { delay } from 'rxjs';
import { swapTokens } from 'src/lib/agent/method/dapps/defi/avnu/swapService';
import { SwapParams } from 'src/lib/utils/types/swap';
import { setTimeout } from 'timers/promises';

describe('Swap Token with avnu-sdk', () => {
  describe('With perfect match input', () => {
    it('should swap token 0.1 ETH to STRK', async () => {
      // Arrange
      const params: SwapParams = {
        sellTokenSymbol: 'ETH',
        buyTokenSymbol: 'STRK',
        sellAmount: 0.1,
      };
      // Act
      await setTimeout(500);

      const result = await swapTokens(params, process.env.PRIVATE_KEY);
      const parsed = JSON.parse(result);

      // Assert
      await setTimeout(500);
      expect(parsed).toMatchObject({
        status: 'success',
        sellAmount: 0.1,
        sellToken: 'ETH',
        buyToken: 'STRK',
      });
    });
    it('should swap token 12 STRK to ETH', async () => {
      // Arrange
      const params: SwapParams = {
        sellTokenSymbol: 'STRK',
        buyTokenSymbol: 'ETH',
        sellAmount: 12,
      };
      // Act
      const result = await swapTokens(params, process.env.PRIVATE_KEY);
      const parsed = JSON.parse(result);
      // Assert
      expect(parsed).toMatchObject({
        status: 'success',
        sellAmount: 12,
        sellToken: 'STRK',
        buyToken: 'ETH',
      });
    });
  });
  describe('With wrong input', () => {
    it('should fail reason : negative sell amount', async () => {
      // Arrange
      const params: SwapParams = {
        sellTokenSymbol: 'ETH',
        buyTokenSymbol: 'STRK',
        sellAmount: -12,
      };
      // Act
      const result = await swapTokens(
        params,
        process.env.PRIVATE_KEY_TEST as string
      );
      const parsed = JSON.parse(result);
      // Assert
      expect(parsed.status).toBe('failure');
    });
    it('should fail reason : invalid sell Token Symbol', async () => {
      // Arrange
      const params: SwapParams = {
        sellTokenSymbol: 'NOTSTRK',
        buyTokenSymbol: 'USDT',
        sellAmount: 15,
      };
      // Act
      const result = await swapTokens(
        params,
        process.env.PRIVATE_KEY_TEST as string
      );
      const parsed = JSON.parse(result);
      // Assert
      expect(parsed.status).toBe('failure');
      expect(parsed.error).toBe(
        `Sell token ${params.sellTokenSymbol} not supported`
      );
    });
    it('should fail reason : invalid buy Token Symbol', async () => {
      // Arrange
      const params: SwapParams = {
        sellTokenSymbol: 'STRK',
        buyTokenSymbol: 'NOTUSDT',
        sellAmount: 15,
      };
      // Act
      const result = await swapTokens(
        params,
        process.env.PRIVATE_KEY_TEST as string
      );
      const parsed = JSON.parse(result);
      // Assert
      expect(parsed.status).toBe('failure');
      expect(parsed.error).toBe(
        `Buy token ${params.buyTokenSymbol} not supported`
      );
    });
    it('should fail reason : invalid reason wrong private key', async () => {
      // Arrange
      const params: SwapParams = {
        sellTokenSymbol: 'STRK',
        buyTokenSymbol: 'USDC',
        sellAmount: 300,
      };
      // Act
      const result = await swapTokens(params, '');
      const parsed = JSON.parse(result);
      // Assert
      expect(parsed.status).toBe('failure');
    });
  });
});
