import { getAddress } from 'src/lib/agent/method/account/getAddress';

describe('getAddress', () => {
  describe('With perfect match', () => {
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

      process.env = { PUBLIC_ADDRESS: mockAddress } as NodeJS.ProcessEnv;

      // Act

      const result = await getAddress();
      const parsed = JSON.parse(result);
      // Assert
      expect(parsed.status).toBe('failure');
    });
  });
});
