import { simulateDeployTransaction } from 'src/lib/agent/method/transaction/simulateTransaction';
import * as C from '../../../utils/constant';
import { agent1, invalidAgent } from 'test/utils/helpers';
describe('Simulate Deploy Transaction ', () => {
  describe('With perfect match inputs', () => {
    it('should simulate deploy transaction with valid payload[classHash]', async () => {
      // Arrange
      const params = {
        accountAddress: process.env.PUBLIC_ADDRESS_2 as string,
        payloads: [
          {
            classHash: C.class_hash,
          },
        ],
      };

      // Act
      const result = await simulateDeployTransaction(
        agent1,
        params
      );
      const parsed = JSON.parse(result);

      // Assert
      expect(parsed.status).toBe('success');
    });

    it('should simulate deploy transaction with valid payload[classHash,constructorCalldata]', async () => {
      // Arrange
      const params = {
        accountAddress: process.env.PUBLIC_ADDRESS_2 as string,
        payloads: [
          {
            classHash: C.class_hash,
            constructorCalldata: [
              '0x6db97f20526e4426d8874148ee83448d370e003d042d669611f7b4cb3917c24',
              '0x0',
            ],
          },
        ],
      };

      // Act
      const result = await simulateDeployTransaction(
        agent1,
        params
      );
      const parsed = JSON.parse(result);

      // Assert
      expect(parsed.status).toBe('success');
    });

    it('should simulate deploy transaction with valid payload[classHash,salt,constructorCalldata]', async () => {
      // Arrange
      const params = {
        accountAddress: process.env.PUBLIC_ADDRESS_2 as string,
        payloads: [
          {
            classHash: C.class_hash,
            salt: C.addressSalt,
            constructorCalldata: [
              '0x6db97f20526e4426d8874148ee83448d370e003d042d669611f7b4cb3917c24',
              '0x0',
            ],
          },
        ],
      };

      // Act
      const result = await simulateDeployTransaction(
        agent1,
        params
      );
      const parsed = JSON.parse(result);

      // Assert
      expect(parsed.status).toBe('success');
    });

    it('should simulate deploy transaction with full payload[classHash,salt,unique,constructorCalldata]', async () => {
      // Arrange
      const params = {
        accountAddress: process.env.PUBLIC_ADDRESS_2 as string,
        payloads: [
          {
            classHash: C.class_hash,
            salt: C.addressSalt,
            unique: true,
            constructorCalldata: [
              '0x6db97f20526e4426d8874148ee83448d370e003d042d669611f7b4cb3917c24',
              '0x0',
            ],
          },
        ],
      };

      // Act
      const result = await simulateDeployTransaction(
        agent1,
        params
      );
      const parsed = JSON.parse(result);

      // Assert
      expect(parsed.status).toBe('success');
    });

    it('should simulate deploy transaction with multiple payloads', async () => {
      // Arrange
      const paramsArray = [
        {
          accountAddress: process.env.PUBLIC_ADDRESS_2 as string,
          payloads: [
            {
              classHash: C.class_hash,
              salt: C.addressSalt,
              unique: true,
              constructorCalldata: [
                '0x6db97f20526e4426d8874148ee83448d370e003d042d669611f7b4cb3917c24',
                '0x0',
              ],
            },
          ],
        },
        {
          accountAddress: process.env.PUBLIC_ADDRESS_3 as string,

          payloads: [
            {
              classHash: C.class_hash,
              constructorCalldata: [
                '0x6db97f20526e4426d8874148ee83448d370e003d042d669611f7b4cb3917c24',
                '0x1',
              ],
            },
          ],
        },
      ];

      // Act & Assert
      for (const params of paramsArray) {
        const result = await simulateDeployTransaction(
          agent1,
          params
        );
        const parsed = JSON.parse(result);
        expect(parsed.status).toBe('success');
      }
    });
  });
  describe('With invalid params', () => {
    it('should fail reason : invalid private_key', async () => {
      // Arrange
      const params = {
        accountAddress: process.env.PUBLIC_ADDRESS_2 as string,
        payloads: [
          {
            classHash: C.class_hash,
            constructorCalldata: [
              '0x6db97f20526e4426d8874148ee83448d370e003d042d669611f7b4cb3917c24',
              '0x0',
            ],
          },
        ],
      };

      // Act
      const result = await simulateDeployTransaction(invalidAgent, params);
      const parsed = JSON.parse(result);

      // Assert
      expect(parsed.status).toBe('failure');
    });

    it('should fail reason : invalid classHash', async () => {
      // Arrange
      const params = {
        accountAddress: process.env.PUBLIC_ADDRESS_2 as string,
        payloads: [
          {
            classHash: '',
            salt: '',
            constructorCalldata: [
              '0x6db97f20526e4426d8874148ee83448d370e003d042d669611f7b4cb3917c24',
              '0x0',
            ],
          },
        ],
      };

      // Act
      const result = await simulateDeployTransaction(
        agent1,
        params
      );
      const parsed = JSON.parse(result);

      // Assert
      expect(parsed.status).toBe('failure');
    });
    it('should fail reason : invalid classHash for second payload', async () => {
      // Arrange
      const paramsArray = [
        {
          accountAddress: process.env.PUBLIC_ADDRESS_2 as string,
          payloads: [
            {
              classHash: C.class_hash,
              salt: C.addressSalt,
              unique: true,
              constructorCalldata: [
                '0x6db97f20526e4426d8874148ee83448d370e003d042d669611f7b4cb3917c24',
                '0x0',
              ],
            },
          ],
        },
        {
          accountAddress: process.env.PUBLIC_ADDRESS_3 as string,
          payloads: [
            {
              classHash: '',
              constructorCalldata: [
                '0x6db97f20526e4426d8874148ee83448d370e003d042d669611f7b4cb3917c24',
                '0x1',
              ],
            },
          ],
        },
      ];

      // Act
      const result = await simulateDeployTransaction(
        agent1,
        paramsArray[0],
      );
      const parsed = JSON.parse(result);
      const result2 = await simulateDeployTransaction(
        agent1,
        paramsArray[1],
      );
      const parsed2 = JSON.parse(result2);

      // Assert
      expect(parsed.status).toBe('success');
      expect(parsed2.status).toBe('failure');
    });
  });
});
