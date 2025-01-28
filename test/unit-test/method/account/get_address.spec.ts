import { getAddress } from 'src/lib/agent/method/account/getAddress';
import { createCustomAgent, globalAgent } from 'test/utils/helpers';

describe('getAddress', () => {
  describe('With perfect match inputs', () => {
    it('returns success with account address', async () => {
      // Arrange
      // Act

      const result = await getAddress(globalAgent);
      const parsed = JSON.parse(result);
      // Assert
      expect(parsed.status).toBe('success');
    });
  });
  describe('With missing inputs', () => {
    it('returns failure reason : invalid account_address', async () => {
      // Arrange
      const mockAddress = '';


      const agent = createCustomAgent({publicKey: mockAddress})
      const result = await getAddress(agent);
      const parsed = JSON.parse(result);
      // Assert
      expect(parsed.status).toBe('failure');
    });
  });
});
