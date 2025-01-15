import { simulateInvokeTransaction } from 'src/lib/agent/method/transaction/simulateTransaction';
import * as C from 'src/test/utils/constant.test';

describe('Simulate Invoke Transaction', () => {
  describe('With perfect match inputs', () => {
    it('should simulate invoke transaction with valid payload', async () => {
      // Arrange
      const params = {
        accountAddress: C.VALID_PUBLIC_ADDRESS_2,
        payloads: [
          {
            contractAddress:
              '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
            entrypoint: 'transfer',
            calldata: ['0x123...', '1000000000000000000'],
          },
        ],
      };
      // Act
      const result = await simulateInvokeTransaction(
        params,
        C.VALID_PRIVATE_KEY_1
      );

      // Assert
      const parsed = JSON.parse(result);
      expect(parsed.status).toBe('success');
      expect(parsed.transaction_output).toBeDefined();
    });
    it('should simulate invoke transaction with valids payloads', async () => {
      // Arrange
      const paramsArray = [
        {
          accountAddress: C.VALID_PUBLIC_ADDRESS_2,
          payloads: [
            {
              contractAddress:
                '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
              entrypoint: 'transfer',
              calldata: ['0x123...', '1000000000000000000'],
            },
          ],
        },
        {
          accountAddress: C.VALID_PUBLIC_ADDRESS_2,
          payloads: [
            {
              contractAddress:
                '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
              entrypoint: 'approve',
              calldata: ['0x456...', '2000000000000000000'],
            },
          ],
        },
        {
          accountAddress: C.VALID_PUBLIC_ADDRESS_2,
          payloads: [
            {
              contractAddress:
                '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
              entrypoint: 'transferFrom',
              calldata: ['0x789...', '3000000000000000000'],
            },
          ],
        },
      ];

      // Act & Assert
      for (const params of paramsArray) {
        const result = await simulateInvokeTransaction(
          params,
          C.VALID_PRIVATE_KEY_1
        );
        const parsed = JSON.parse(result);
        expect(parsed.status).toBe('success');
        expect(parsed.transaction_output).toBeDefined();
      }
    });
    it('should fail with empty calldata', async () => {
      // Arrange
      const params = {
        accountAddress: C.VALID_PUBLIC_ADDRESS_2,
        payloads: [
          {
            contractAddress:
              '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
            entrypoint: '',
          },
        ],
      };

      // Act
      const result = await simulateInvokeTransaction(
        params,
        C.VALID_PRIVATE_KEY_1
      );
      const parsed = JSON.parse(result);

      // Assert
      expect(parsed.status).toBe('failure');
    });

    it('should fail reason : invalid privateKey ', async () => {
      // Arrange
      const params = {
        accountAddress: C.VALID_PUBLIC_ADDRESS_2,
        payloads: [
          {
            contractAddress:
              '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
            entrypoint: 'approve',
            calldata: ['0x789...', '3000000000000000000'],
          },
        ],
      };

      // Act
      const result = await simulateInvokeTransaction(
        params,
        C.INVALID_CONTRACT_ADDRESS_1
      );
      const parsed = JSON.parse(result);

      // Assert
      expect(parsed.status).toBe('failure');
    });

    it('should fail reason : empty contract address', async () => {
      // Arrange
      const params = {
        accountAddress: C.VALID_PUBLIC_ADDRESS_2,
        payloads: [
          {
            contractAddress: '', // Adresse vide
            entrypoint: 'transferFrom',
            calldata: [
              '0x06d8aB6b762E4B4896efCb27960756394033B9b5a5619EaB63Dd5962Bd1173c4',
              '3000000000000000000',
            ],
          },
        ],
      };

      // Act
      const result = await simulateInvokeTransaction(
        params,
        C.VALID_PRIVATE_KEY_1
      );
      const parsed = JSON.parse(result);

      // Assert
      expect(parsed.status).toBe('failure');
    });
  });
});
