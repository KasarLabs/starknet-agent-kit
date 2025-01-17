import { simulateDeclareTransaction } from 'src/lib/agent/method/transaction/simulateTransaction';

describe('Simulate Declare Transaction ', () => {
  describe('With perfect match inputs', () => {
    it('should simulate declare transaction with valid contract', async () => {
      // Arrange
      const params = {
        accountAddress: process.env.PUBLIC_ADDRESS_2 as string,
        contract: {
          program: {
            builtins: ['range_check', 'pedersen', 'bitwise'],
            compiler_version: '2.1.0',
            data: ['0x480680017fff8000'],
            hints: {},
            main_scope: '0x0',
            prime:
              '0x800000000000011000000000000000000000000000000000000000000000001',
            identifiers: {},
            debug_info: {
              file_contents: {},
              instruction_locations: {},
            },
            reference_manager: {
              references: [],
            },
          },
          entry_points_by_type: {
            CONSTRUCTOR: [],
            EXTERNAL: [
              {
                selector:
                  '0x0000000000000000000000000000000000000000000000000000000000000001',
                offset: '0x0',
              },
            ],
            L1_HANDLER: [],
          },
          abi: [
            {
              type: 'function',
              name: 'dummy',
              inputs: [],
              outputs: [],
            },
          ],
        },
      };

      // Act
      const result = await simulateDeclareTransaction(
        params,
        process.env.PRIVATE_KEY
      );
      const parsed = JSON.parse(result);

      // Assert
      expect(parsed.status).toBe('success');
    });

    it('should simulate declare transaction with valid contract and classHash', async () => {
      // Arrange
      const params = {
        accountAddress: process.env.PUBLIC_ADDRESS_2 as string,
        contract: {
          program: {
            builtins: ['range_check', 'pedersen', 'bitwise'],
            compiler_version: '2.1.0',
            data: ['0x480680017fff8000'],
            hints: {},
            main_scope: '0x0',
            prime:
              '0x800000000000011000000000000000000000000000000000000000000000001',
            identifiers: {},
            debug_info: {
              file_contents: {},
              instruction_locations: {},
            },
            reference_manager: {
              references: [],
            },
          },
          entry_points_by_type: {
            CONSTRUCTOR: [],
            EXTERNAL: [
              {
                selector:
                  '0x0000000000000000000000000000000000000000000000000000000000000001',
                offset: '0x0',
              },
            ],
            L1_HANDLER: [],
          },
          abi: [
            {
              type: 'function',
              name: 'dummy',
              inputs: [],
              outputs: [],
            },
          ],
        },
        classHash:
          '0x1a736d6ed154502257f02b1ccdf4d9d1089f80811cd6acad48e6b6a9d1f2003',
      };

      // Act
      const result = await simulateDeclareTransaction(
        params,
        process.env.PRIVATE_KEY
      );
      const parsed = JSON.parse(result);

      // Assert
      expect(parsed.status).toBe('success');
    });

    it('should simulate declare transaction with all optional parameters', async () => {
      // Arrange
      const params = {
        accountAddress: process.env.PUBLIC_ADDRESS_2 as string,
        contract: {
          program: {
            builtins: ['range_check', 'pedersen', 'bitwise'],
            compiler_version: '2.1.0',
            data: ['0x480680017fff8000'],
            hints: {},
            main_scope: '0x0',
            prime:
              '0x800000000000011000000000000000000000000000000000000000000000001',
            identifiers: {},
            debug_info: {
              file_contents: {},
              instruction_locations: {},
            },
            reference_manager: {
              references: [],
            },
          },
          entry_points_by_type: {
            CONSTRUCTOR: [],
            EXTERNAL: [
              {
                selector:
                  '0x0000000000000000000000000000000000000000000000000000000000000001',
                offset: '0x0',
              },
            ],
            L1_HANDLER: [],
          },
          abi: [
            {
              type: 'function',
              name: 'dummy',
              inputs: [],
              outputs: [],
            },
          ],
        },
        classHash:
          '0x1a736d6ed154502257f02b1ccdf4d9d1089f80811cd6acad48e6b6a9d1f2003',
        compiledClassHash:
          '0x2b847d6ed154502257f02b1ccdf4d9d1089f80811cd6acad48e6b6a9d1f2003',
      };

      // Act
      const result = await simulateDeclareTransaction(
        params,
        process.env.PRIVATE_KEY
      );
      const parsed = JSON.parse(result);

      // Assert
      expect(parsed.status).toBe('success');
    });

    it('should simulate declare transaction with multiple params', async () => {
      // Arrange
      const paramsArray = [
        {
          accountAddress: process.env.PUBLIC_ADDRESS_2 as string,
          contract: {
            program: {
              builtins: ['range_check', 'pedersen', 'bitwise'],
              compiler_version: '2.1.0',
              data: ['0x480680017fff8000'],
              hints: {},
              main_scope: '0x0',
              prime:
                '0x800000000000011000000000000000000000000000000000000000000000001',
              identifiers: {},
              debug_info: {
                file_contents: {},
                instruction_locations: {},
              },
              reference_manager: {
                references: [],
              },
            },
            entry_points_by_type: {
              CONSTRUCTOR: [],
              EXTERNAL: [
                {
                  selector:
                    '0x0000000000000000000000000000000000000000000000000000000000000001',
                  offset: '0x0',
                },
              ],
              L1_HANDLER: [],
            },
            abi: [
              {
                type: 'function',
                name: 'dummy',
                inputs: [],
                outputs: [],
              },
            ],
          },
        },
        {
          accountAddress:
            '0x7e89353032016c67ebd7c22058e013b5b71994a46be277d2336c3fac0459522',
          contract: {
            program: {
              builtins: ['range_check', 'pedersen', 'bitwise'],
              compiler_version: '2.1.0',
              data: ['0x480680017fff8000'],
              hints: {},
              main_scope: '0x0',
              prime:
                '0x800000000000011000000000000000000000000000000000000000000000001',
              identifiers: {},
              debug_info: {
                file_contents: {},
                instruction_locations: {},
              },
              reference_manager: {
                references: [],
              },
            },
            entry_points_by_type: {
              CONSTRUCTOR: [],
              EXTERNAL: [
                {
                  selector:
                    '0x0000000000000000000000000000000000000000000000000000000000000001',
                  offset: '0x0',
                },
              ],
              L1_HANDLER: [],
            },
            abi: [
              {
                type: 'function',
                name: 'dummy',
                inputs: [],
                outputs: [],
              },
            ],
          },
          classHash:
            '0x1a736d6ed154502257f02b1ccdf4d9d1089f80811cd6acad48e6b6a9d1f2003',
        },
      ];

      // Act & Assert
      for (const params of paramsArray) {
        const result = await simulateDeclareTransaction(
          params,
          process.env.PRIVATE_KEY
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
        contract: {
          program: {
            builtins: ['range_check', 'pedersen', 'bitwise'],
            compiler_version: '2.1.0',
            data: ['0x480680017fff8000'],
            hints: {},
            main_scope: '0x0',
            prime:
              '0x800000000000011000000000000000000000000000000000000000000000001',
            identifiers: {},
            debug_info: { file_contents: {}, instruction_locations: {} },
            reference_manager: { references: [] },
          },
          entry_points_by_type: {
            CONSTRUCTOR: [],
            EXTERNAL: [
              {
                selector:
                  '0x0000000000000000000000000000000000000000000000000000000000000001',
                offset: '0x0',
              },
            ],
            L1_HANDLER: [],
          },
          abi: [{ type: 'function', name: 'dummy', inputs: [], outputs: [] }],
        },
      };

      // Act
      const result = await simulateDeclareTransaction(params, '0xinvalid');
      const parsed = JSON.parse(result);
      // Assert

      expect(parsed.status).toBe('failure');
    });

    it('should fail reason : invalid contract values among valid ones', async () => {
      // Arrange
      const paramsArray = [
        {
          accountAddress: process.env.PUBLIC_ADDRESS_2 as string,
          contract: {
            program: {
              builtins: ['range_check', 'pedersen', 'bitwise'],
              compiler_version: '2.1.0',
              data: ['0x480680017fff8000'],
              hints: {},
              main_scope: '0x0',
              prime:
                '0x800000000000011000000000000000000000000000000000000000000000001',
              identifiers: {},
              debug_info: { file_contents: {}, instruction_locations: {} },
              reference_manager: { references: [] },
            },
            entry_points_by_type: {
              CONSTRUCTOR: [],
              EXTERNAL: [{ selector: '0x1', offset: '0x0' }],
              L1_HANDLER: [],
            },
            abi: [{ type: 'function', name: 'dummy', inputs: [], outputs: [] }],
          },
        },
        {
          accountAddress:
            '0x7e89353032016c67ebd7c22058e013b5b71994a46be277d2336c3fac0459522',
          contract: {
            program: {
              builtins: ['range_check', 'pedersen', 'bitwise'],
              compiler_version: '',
              data: ['0x480680017fff8000'],
              hints: {},
              main_scope: '0x0',
              prime: 4432,
              identifiers: {},
              debug_info: { file_contents: {}, instruction_locations: {} },
              reference_manager: { references: [] },
            },
            entry_points_by_type: {
              CONSTRUCTOR: [],
              EXTERNAL: [{ selector: '0x1', offset: '0x0' }],
              L1_HANDLER: [],
            },
            abi: [{ type: 'function', name: 'dummy', inputs: [], outputs: [] }],
          },
        },
      ];
      // Act
      const result = await simulateDeclareTransaction(
        paramsArray[0],
        process.env.PRIVATE_KEY
      );
      const parsed = JSON.parse(result);
      const result2 = await simulateDeclareTransaction(
        paramsArray[1],
        process.env.PRIVATE_KEY
      );
      const parsed2 = JSON.parse(result2);

      // Assert
      expect(parsed.status).toBe('success');
      expect(parsed2.status).toBe('failure');
    });
  });
});
