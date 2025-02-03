import { verifyProofService } from "src/lib/agent/method/infra/atlantic/verifyProofService";
import { AtlanticParam } from "src/lib/utils/types/atlantic";
import { createMockStarknetAgent } from "test/jest/setEnvVars";

const agent = createMockStarknetAgent();

describe('getProofService', () => {
    describe('With perfect match inputs', () => {});
    it('Should return an url to atlantic dashboard with query id', async () => {
      const getProofParam: AtlanticParam = {
          filename: '/test/recursive_proof.json'
      }

      const result = await verifyProofService(agent, getProofParam);
      const parsed = JSON.parse(result);
  
      expect(parsed).toEqual({
        status: 'success',
        url: expect.any(String),
      });
    });
    describe('With no filename input', () => {});
    it('Invalid Type', async () => {
      const getProofParam: AtlanticParam = {
          filename: '/test/Pie.zip'
      }

      const result = await verifyProofService(agent, getProofParam);
      const parsed = JSON.parse(result);

      expect(parsed).toEqual({
        status: 'failure',
        error: expect.any(String),
      });
    });
    it('Invalid filename', async () => {
      const getProofParam: AtlanticParam = {
          filename: 'gfdhjgfdg'
      }

      const result = await verifyProofService(agent, getProofParam);
      const parsed = JSON.parse(result);

      expect(parsed).toEqual({
        status: 'failure',
        error: expect.any(String),
      });
    })
  });