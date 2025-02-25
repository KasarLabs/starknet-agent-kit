import { declareAndDeployContract } from 'src/lib/agent/plugins/erc721/actions/declareAndDeploy';
import { createMockStarknetAgent, createMockInvalidStarknetAgent } from 'test/jest/setEnvVars';

const agent = createMockStarknetAgent();
const wrong_agent = createMockInvalidStarknetAgent();

describe('Declare Contract', () => {
  describe('With valid agent and parameters', () => {
    it('should successfully declare and deploy a contract', async () => {
      const params = {
        totalSupply: "1"
      };

      const result = await declareAndDeployContract(params, agent);
      const parsed = JSON.parse(result);

      console.log(parsed);

      expect(parsed).toMatchObject({
        status: 'success',
        transactionHash: expect.any(String),
        classHash: expect.any(String),
        contractAddress: expect.any(String)
      });
    });
  });

  describe('With invalid parameters', () => {
    it('should fail when account credentials are missing', async () => {
      const params = {
        totalSupply: "100"
      };


      const result = await declareAndDeployContract(params, wrong_agent);
      const parsed = JSON.parse(result);

      expect(parsed).toMatchObject({
        status: 'failure'
      });
    });

    it('should fail when invalid params', async () => {
      const params = {
        totalSupply: ""
      };

      const result = await declareAndDeployContract(params, agent);
      const parsed = JSON.parse(result);

      expect(parsed).toMatchObject({
        status: 'failure',
        error: expect.any(String)
      });
    });
  });
});