import { getAddress } from 'src/lib/agent/plugins/core/account/getAddress';

describe('getAddress', () => {
  describe('With perfect match inputs', () => {
    it('returns success with account address', async () => {
      // Arrange
      // Act

      const result = await getAddress();
      const parsed = JSON.parse(result);
      // Assert
      expect(parsed.status).toBe('success');
    });
  });
  describe('With missing inputs', () => {
    it('returns failure reason : invalid account_address', async () => {
      // Arrange
      const mockAddress = '';

      process.env = { STARKNET_PUBLIC_ADDRESS: mockAddress } as NodeJS.ProcessEnv;

      // Act

      const result = await getAddress();
      const parsed = JSON.parse(result);
      // Assert
      expect(parsed.status).toBe('failure');
    });
  });
});
