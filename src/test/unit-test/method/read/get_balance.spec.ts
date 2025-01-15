import { getBalance } from 'src/lib/agent/method/read/balance';
import * as C from 'src/test/utils/constant.test';
import { Contract } from 'starknet';

jest.mock('starknet', () => ({
  Contract: jest.fn(),
  RpcProvider: jest.fn(() => ({})),
}));

describe('Read -> Get_Balance -> get_balance', () => {
  const mockBalanceOf = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (Contract as jest.Mock).mockImplementation(() => ({
      balanceOf: mockBalanceOf,
    }));

    mockBalanceOf.mockResolvedValue({ balance: '2000000000000000000' });
  });

  describe('With perfect match inputs', () => {
    it('should return correct ETH balance when all parameters are valid', async () => {
      // Arrange
      const params = {
        walletAddress: C.VALID_CONTRACT_ADDRESS_1,
        assetSymbol: 'ETH',
      };

      // Act
      const result = await getBalance(params);
      const parsed = JSON.parse(result);

      // Assert
      expect(parsed.status).toBe('success');
      expect(parsed.balance).toBe('2');
    });

    it('should return correct USDC balance with 6 decimals', async () => {
      // Arrange
      mockBalanceOf.mockResolvedValue({ balance: '2000000' });
      const params = {
        walletAddress: C.VALID_CONTRACT_ADDRESS_1,
        assetSymbol: 'USDC',
      };

      // Act
      const result = await getBalance(params);
      const parsed = JSON.parse(result);

      // Assert
      expect(parsed.status).toBe('success');
      expect(parsed.balance).toBe('2');
    });
  });
  describe('With missing inputs', () => {
    it('should fail reason : unsupported token symbol', async () => {
      // Arrange
      const params = {
        walletAddress: C.VALID_CONTRACT_ADDRESS_1,
        assetSymbol: 'UNKNOWN',
      };
      // Act
      const result = await getBalance(params);
      const parsed = JSON.parse(result);

      // Assert
      expect(parsed.status).toBe('failure');
      expect(parsed.error).toBe('Token UNKNOWN not supported');
    });
  });
});
