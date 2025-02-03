import { getAddress } from 'src/lib/agent/method/account/getAddress';
import { createMockStarknetAgent } from 'test/jest/setEnvVars';

const agent = createMockStarknetAgent();

describe('getAddress', () => {
  describe('With perfect match inputs', () => {
    it('returns success with account address', async () => {
      // Arrange
      // Act

      const result = await getAddress(agent);
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

      const result = await getAddress(agent);
      const parsed = JSON.parse(result);
      // Assert
      expect(parsed.status).toBe('failure');
    });
  });
});
