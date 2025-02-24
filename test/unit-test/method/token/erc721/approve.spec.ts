import { approve } from 'src/lib/agent/plugins/erc721/actions/approve';
import { getApproved } from 'src/lib/agent/plugins/erc721/actions/getApproved';
import { createMockStarknetAgent, createMockInvalidStarknetAgent } from 'test/jest/setEnvVars';
import { validateAddress } from 'src/lib/agent/plugins/erc721/utils/nft';

const agent = createMockStarknetAgent();
const wrong_agent = createMockInvalidStarknetAgent();
const NFT_ADDRESS = '0x04165af38fe2ce3bf1ec84b90f38a491a949b6c7ec7373242806f82d348715da';

describe('Approve Token', () => {
    describe('With perfect match inputs', () => {
      it('should approve address for token and verify approval', async () => {
        // Arrange
        const approvedAddress = process.env.STARKNET_PUBLIC_ADDRESS_2 as string;
        const params = {
          approvedAddress,
          tokenId: '1',
          contractAddress: NFT_ADDRESS
        };
  
        // Act - Approve the address
        const approveResult = await approve(agent, params);
        const parsedApprove = JSON.parse(approveResult);
  
        // Assert - Check approve transaction success
        expect(parsedApprove).toMatchObject({
          status: 'success',
          tokenId: '1',
          approved: true,
          transactionHash: expect.any(String)
        });
  
        // Act - Get approved address
        const getApprovedParams = {
          tokenId: '1',
          contractAddress: NFT_ADDRESS
        };
        const getApprovedResult = await getApproved(agent, getApprovedParams);
        const parsedGetApproved = JSON.parse(getApprovedResult);
  
        // Assert - Verify the approved address matches
        // Convert hex address to decimal for comparison
        const approvedAddressDecimal = BigInt(validateAddress(approvedAddress)).toString();
        
        expect(parsedGetApproved).toMatchObject({
          status: 'success',
          approved: approvedAddressDecimal
        });
      });
    });

  describe('With wrong inputs', () => {
    it('should fail with invalid operator address', async () => {
      const params = {
        approvedAddress: 'invalid_address',
        tokenId: '1',
        contractAddress: NFT_ADDRESS
      };

      const result = await approve(agent, params);
      const parsed = JSON.parse(result);

      expect(parsed).toMatchObject({
        status: 'failure',
        error: expect.any(String)
      });
    });

    it('should fail with invalid agent', async () => {
      const params = {
        approvedAddress: process.env.STARKNET_PUBLIC_ADDRESS_2 as string,
        tokenId: '1',
        contractAddress: NFT_ADDRESS
      };

      const result = await approve(wrong_agent, params);
      const parsed = JSON.parse(result);

      expect(parsed).toMatchObject({
        status: 'failure'
      });
    });
  });
});