import { simulateDeployTransaction } from 'src/lib/agent/method/transaction/simulateTransaction';
import * as C from 'src/test/utils/constant.test';

describe('Simulate Deploy Transaction ', () => {
  describe('With perfect match inputs', () => {
    it('should simulate deploy transaction with valid payload[classHash]', async () => {
      // Arrange
      const params = {
        accountAddress:
          '0x6d89353032016c67ebd7c22058e013b5b71994a46be277d2336c3fac0459521',
        payloads: [
          {
            classHash:
              '0x1a736d6ed154502257f02b1ccdf4d9d1089f80811cd6acad48e6b6a9d1f2003',
          },
        ],
      };

      // Act
      const result = await simulateDeployTransaction(
        params,
        C.VALID_PRIVATE_KEY_1
      );
      const parsed = JSON.parse(result);

      // Assert
      expect(parsed.status).toBe('success');
    });

    it('should simulate deploy transaction with valid payload[classHash,constructorCalldata]', async () => {
      // Arrange
      const params = {
        accountAddress:
          '0x6d89353032016c67ebd7c22058e013b5b71994a46be277d2336c3fac0459521',
        payloads: [
          {
            classHash:
              '0x1a736d6ed154502257f02b1ccdf4d9d1089f80811cd6acad48e6b6a9d1f2003',
            constructorCalldata: [
              '0x6db97f20526e4426d8874148ee83448d370e003d042d669611f7b4cb3917c24',
              '0x0',
            ],
          },
        ],
      };

      // Act
      const result = await simulateDeployTransaction(
        params,
        C.VALID_PRIVATE_KEY_1
      );
      const parsed = JSON.parse(result);

      // Assert
      expect(parsed.status).toBe('success');
    });

    it('should simulate deploy transaction with valid payload[classHash,salt,constructorCalldata]', async () => {
      // Arrange
      const params = {
        accountAddress:
          '0x6d89353032016c67ebd7c22058e013b5b71994a46be277d2336c3fac0459521',
        payloads: [
          {
            classHash:
              '0x1a736d6ed154502257f02b1ccdf4d9d1089f80811cd6acad48e6b6a9d1f2003',
            salt: '0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
            constructorCalldata: [
              '0x6db97f20526e4426d8874148ee83448d370e003d042d669611f7b4cb3917c24',
              '0x0',
            ],
          },
        ],
      };

      // Act
      const result = await simulateDeployTransaction(
        params,
        C.VALID_PRIVATE_KEY_1
      );
      const parsed = JSON.parse(result);

      // Assert
      expect(parsed.status).toBe('success');
    });

    it('should simulate deploy transaction with full payload[classHash,salt,unique,constructorCalldata]', async () => {
      // Arrange
      const params = {
        accountAddress:
          '0x6d89353032016c67ebd7c22058e013b5b71994a46be277d2336c3fac0459521',
        payloads: [
          {
            classHash:
              '0x1a736d6ed154502257f02b1ccdf4d9d1089f80811cd6acad48e6b6a9d1f2003',
            salt: '0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
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
        params,
        C.VALID_PRIVATE_KEY_1
      );
      const parsed = JSON.parse(result);

      // Assert
      expect(parsed.status).toBe('success');
    });

    it('should simulate deploy transaction with multiple payloads', async () => {
      // Arrange
      const paramsArray = [
        {
          accountAddress:
            '0x6d89353032016c67ebd7c22058e013b5b71994a46be277d2336c3fac0459521',
          payloads: [
            {
              classHash:
                '0x1a736d6ed154502257f02b1ccdf4d9d1089f80811cd6acad48e6b6a9d1f2003',
              salt: '0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
              unique: true,
              constructorCalldata: [
                '0x6db97f20526e4426d8874148ee83448d370e003d042d669611f7b4cb3917c24',
                '0x0',
              ],
            },
          ],
        },
        {
          accountAddress:
            '0x7e89353032016c67ebd7c22058e013b5b71994a46be277d2336c3fac0459522',
          payloads: [
            {
              classHash:
                '0x1a736d6ed154502257f02b1ccdf4d9d1089f80811cd6acad48e6b6a9d1f2003',
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
          params,
          C.VALID_PRIVATE_KEY_1
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
        accountAddress:
          '0x6d89353032016c67ebd7c22058e013b5b71994a46be277d2336c3fac0459521',
        payloads: [
          {
            classHash:
              '0x1a736d6ed154502257f02b1ccdf4d9d1089f80811cd6acad48e6b6a9d1f2003',
            constructorCalldata: [
              '0x6db97f20526e4426d8874148ee83448d370e003d042d669611f7b4cb3917c24',
              '0x0',
            ],
          },
        ],
      };

      // Act
      const result = await simulateDeployTransaction(
        params,
        C.INVALID_PRIVATE_KEY_1
      );
      const parsed = JSON.parse(result);

      // Assert
      expect(parsed.status).toBe('failure');
    });

    it('should fail reason : invalid classHash', async () => {
      // Arrange
      const params = {
        accountAddress:
          '0x6d89353032016c67ebd7c22058e013b5b71994a46be277d2336c3fac0459521',
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
        params,
        C.VALID_PRIVATE_KEY_1
      );
      const parsed = JSON.parse(result);

      // Assert
      expect(parsed.status).toBe('failure');
    });
    it('should fail reason : invalid classHash for second payload', async () => {
      // Arrange
      const paramsArray = [
        {
          accountAddress:
            '0x6d89353032016c67ebd7c22058e013b5b71994a46be277d2336c3fac0459521',
          payloads: [
            {
              classHash:
                '0x1a736d6ed154502257f02b1ccdf4d9d1089f80811cd6acad48e6b6a9d1f2003',
              salt: '0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
              unique: true,
              constructorCalldata: [
                '0x6db97f20526e4426d8874148ee83448d370e003d042d669611f7b4cb3917c24',
                '0x0',
              ],
            },
          ],
        },
        {
          accountAddress:
            '0x7e89353032016c67ebd7c22058e013b5b71994a46be277d2336c3fac0459522',
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
        paramsArray[0],
        C.VALID_PRIVATE_KEY_1
      );
      const parsed = JSON.parse(result);
      const result2 = await simulateDeployTransaction(
        paramsArray[1],
        C.VALID_PRIVATE_KEY_1
      );
      const parsed2 = JSON.parse(result2);

      // Assert
      expect(parsed.status).toBe('success');
      expect(parsed2.status).toBe('failure');
    });
  });
});
