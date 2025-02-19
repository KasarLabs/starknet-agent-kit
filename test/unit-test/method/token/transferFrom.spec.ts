import { approve } from 'src/lib/agent/plugins/erc20/actions/approve';
import { transfer_from } from 'src/lib/agent/plugins/erc20/actions/transferFrom';
import { createMockStarknetAgent } from 'test/jest/setEnvVars';
import { setupTestEnvironment } from 'test/utils/helpers';

const agent = createMockStarknetAgent();
setupTestEnvironment();

describe('TransferFrom with prior approval', () => {
  describe('Success scenarios', () => {
    it('should successfully approve and transfer tokens', async () => {
      // First: Approve tokens
      const approveParams = {
        spender_address: process.env.STARKNET_PUBLIC_ADDRESS_2 as string,
        amount: '1.0',
        symbol: 'ETH'
      };

      const approveResult = await approve(agent, approveParams);
      const parsedApprove = JSON.parse(approveResult);
      
      expect(parsedApprove).toMatchObject({
        status: 'success',
        transactionHash: expect.any(String)
      });

      // Then: Transfer the approved tokens
      const transferParams = {
        fromAddress: process.env.STARKNET_PUBLIC_ADDRESS as string,
        toAddress: process.env.STARKNET_PUBLIC_ADDRESS_2 as string,
        amount: '0.5', // Less than approved amount
        symbol: 'ETH'
      };

      const transferResult = await transfer_from(agent, transferParams);
      const parsedTransfer = JSON.parse(transferResult);

      expect(parsedTransfer).toMatchObject({
        status: 'success',
        transactionHash: expect.any(String)
      });
    });
  });

  describe('Failure scenarios', () => {
    it('should fail when trying to transfer more than approved amount', async () => {
      // First: Approve a small amount
      const approveParams = {
        spender_address: process.env.STARKNET_PUBLIC_ADDRESS_2 as string,
        amount: '0.1',
        symbol: 'ETH'
      };

      await approve(agent, approveParams);

      // Then: Try to transfer more than approved
      const transferParams = {
        fromAddress: process.env.STARKNET_PUBLIC_ADDRESS as string,
        toAddress: process.env.STARKNET_PUBLIC_ADDRESS_2 as string,
        amount: '1.0', // More than approved amount
        symbol: 'ETH'
      };

      const result = await transfer_from(agent, transferParams);
      const parsed = JSON.parse(result);

      expect(parsed).toMatchObject({
        status: 'failure'
      });
    });

    it('should fail when trying to transfer without prior approval', async () => {
      const transferParams = {
        fromAddress: process.env.STARKNET_PUBLIC_ADDRESS_2 as string,
        toAddress: process.env.STARKNET_PUBLIC_ADDRESS_3 as string,
        amount: '1.0',
        symbol: 'ETH'
      };

      const result = await transfer_from(agent, transferParams);
      const parsed = JSON.parse(result);

      expect(parsed).toMatchObject({
        status: 'failure'
      });
    });
  });

  describe('Input validation', () => {
    it('should fail with invalid from address after approval', async () => {
      // First: Approve tokens
      const approveParams = {
        spender_address: process.env.STARKNET_PUBLIC_ADDRESS as string,
        amount: '1.0',
        symbol: 'ETH'
      };

      await approve(agent, approveParams);

      // Then: Try transfer with invalid from address
      const transferParams = {
        fromAddress: 'invalid_address',
        toAddress: process.env.STARKNET_PUBLIC_ADDRESS_3 as string,
        amount: '0.5',
        symbol: 'ETH'
      };

      const result = await transfer_from(agent, transferParams);
      const parsed = JSON.parse(result);

      expect(parsed).toMatchObject({
        status: 'failure'
      });
    });

    it('should fail with invalid token symbol', async () => {
      const transferParams = {
        fromAddress: process.env.STARKNET_PUBLIC_ADDRESS_2 as string,
        toAddress: process.env.STARKNET_PUBLIC_ADDRESS_3 as string,
        amount: '0.5',
        symbol: 'INVALID_TOKEN'
      };

      const result = await transfer_from(agent, transferParams);
      const parsed = JSON.parse(result);

      expect(parsed).toMatchObject({
        status: 'failure'
      });
    });

    it('should fail with invalid amount format', async () => {
      const transferParams = {
        fromAddress: process.env.STARKNET_PUBLIC_ADDRESS_2 as string,
        toAddress: process.env.STARKNET_PUBLIC_ADDRESS_3 as string,
        amount: 'invalid_amount',
        symbol: 'ETH'
      };

      const result = await transfer_from(agent, transferParams);
      const parsed = JSON.parse(result);

      expect(parsed).toMatchObject({
        status: 'failure'
      });
    });
  });

  describe('Edge cases', () => {
    it('should fail when transferring to same address as from', async () => {
      // First: Approve tokens
      const approveParams = {
        spender_address: process.env.STARKNET_PUBLIC_ADDRESS_2 as string,
        amount: '1.0',
        symbol: 'ETH'
      };

      await approve(agent, approveParams);

      // Then: Try self-transfer
      const transferParams = {
        fromAddress: process.env.STARKNET_PUBLIC_ADDRESS_2 as string,
        toAddress: process.env.STARKNET_PUBLIC_ADDRESS_2 as string,
        amount: '0.5',
        symbol: 'ETH'
      };

      const result = await transfer_from(agent, transferParams);
      const parsed = JSON.parse(result);

      expect(parsed).toMatchObject({
        status: 'failure'
      });
    });
  });
});