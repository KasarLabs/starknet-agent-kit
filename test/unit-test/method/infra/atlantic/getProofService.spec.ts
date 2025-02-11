import { getProofService } from 'src/lib/agent/plugins/infra/atlantic/getProofService';
import { AtlanticParam } from 'src/lib/agent/plugins/infra/atlantic/types/Atlantic';
import { createMockStarknetAgent } from 'test/jest/setEnvVars';

const agent = createMockStarknetAgent();

describe('getProofService', () => {
  describe('With perfect match inputs', () => {});
  it('Should return an url to atlantic dashboard with query id', async () => {
    const getProofParam: AtlanticParam = {
      filename: '/test/Pie.zip',
    };

    const result = await getProofService(agent, getProofParam);
    const parsed = JSON.parse(result);

    expect(parsed).toEqual({
      status: 'success',
      url: expect.any(String),
    });
  });
  describe('With no filename input', () => {});
  it('Invalid type', async () => {
    const getProofParam: AtlanticParam = {
      filename: '/test/Proof.json',
    };

    const result = await getProofService(agent, getProofParam);
    const parsed = JSON.parse(result);

    expect(parsed).toEqual({
      status: 'failure',
      error: expect.any(String),
    });
  });
  it('Invalid filename', async () => {
    const getProofParam: AtlanticParam = {
      filename: 'gfdhjgfdg',
    };

    const result = await getProofService(agent, getProofParam);
    const parsed = JSON.parse(result);

    expect(parsed).toEqual({
      status: 'failure',
      error: expect.any(String),
    });
  });
});
