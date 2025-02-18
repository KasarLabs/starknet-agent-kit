import { transfer } from 'src/lib/agent/plugins/erc20/actions/transfer';
import * as C from '../../../utils/constant';
import { createMockStarknetAgent } from 'test/jest/setEnvVars';
import { setupTestEnvironment } from 'test/utils/helpers';

const agent = createMockStarknetAgent();

setupTestEnvironment();

describe('Transfer token', () => {
  describe('With perfect match inputs', () => {
    it('should transfer 0.01 STRK to another address', async () => {
      // Arrange
      const params = {
        recipient_address: '0x072c5a698b4612E1215970A8A96768242e23A54818AD97925d15d329082774Cf' as string,
        amount: '0.01',
        symbol:'STRK',
      };

      // Act
      const result = await transfer(agent, params);
      const parsed = JSON.parse(result);

      console.log('parsed', parsed);
      // Assert
      expect(parsed).toMatchObject({
        status: 'success',
        // amount: '0.01',
        // address: '0x4718F5A0FC34CC1AF16A1CDEE98FFB20C31F5CD61D6AB07201858F4287C938D',
        // recipients_address: '0x078662e7352d062084b0010068b99288486c2d8b914f6e2a55ce945f8792c8b1' as string,
      });
    });
  });

  // describe('With wrong input', () => {
    // it('should fail with invalid recipient address', async () => {
    //   // Arrange
    //   const params = {
    //     recipient_address: 'invalid_address',
    //     amount: '0.2',
    //     symbol: 'ETH',
    //   };

    //   // Act
    //   const result = await transfer(agent, params);
    //   const parsed = JSON.parse(result);

    //   // Assert
    //   expect(parsed).toMatchObject({
    //     status: 'failure',
    //   });
    // });

  //   it('should fail with invalid amount format', async () => {
  //     // Arrange
  //     const params = {
  //       recipient_address: process.env.STARKNET_PUBLIC_ADDRESS_2 as string,
  //       amount: 'WRONG_AMOUNT',
  //       symbol: 'ETH',
  //     };

  //     // Act
  //     const result = await transfer(agent, params);
  //     const parsed = JSON.parse(result);

  //     // Assert
  //     expect(parsed).toMatchObject({
  //       status: 'failure',
  //     });
  //   });

  //   it('should fail with unsupported token symbol', async () => {
  //     // Arrange
  //     const params = {
  //       recipient_address: process.env.STARKNET_PUBLIC_ADDRESS_2 as string,
  //       amount: '0.2',
  //       symbol: 'UNKNOWN',
  //     };

  //     // Act
  //     const result = await transfer(agent, params);
  //     const parsed = JSON.parse(result);

  //     // Assert
  //     expect(parsed).toMatchObject({
  //       status: 'failure',
  //     });
  //   });
  // });

  // describe('With good params but insufficient balance', () => {
  //   it('should fail due to insufficient balance', async () => {
  //     // Arrange
  //     const params = {
  //       recipient_address: process.env.STARKNET_PUBLIC_ADDRESS_2 as string,
  //       amount: '1000000',
  //       symbol: 'ETH',
  //     };

  //     // Act
  //     const result = await transfer(agent, params);
  //     const parsed = JSON.parse(result);

  //     // Assert
  //     expect(parsed).toMatchObject({
  //       status: 'failure',
  //     });
  //   });
  // });
});
