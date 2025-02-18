import { getProofService } from 'src/lib/agent/plugins/atlantic/actions/getProofService';
import { AtlanticParam } from 'src/lib/agent/plugins/atlantic/types/Atlantic';
import { createMockStarknetAgent } from 'test/jest/setEnvVars';

const agent = createMockStarknetAgent();

describe('getProofService', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules(); // Most important - it clears the cache
    process.env = { ...OLD_ENV }; // Make a copy
  });
  afterAll(() => {
    process.env = OLD_ENV; // Restore old environment
  });
  describe('With perfect match inputs', () => {});
  it('Should return an url to atlantic dashboard with query id', async () => {
    process.env.ATLANTIC_API_KEY = 'Place your api key here';
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
    process.env.ATLANTIC_API_KEY = 'Place your api key here';
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
    process.env.ATLANTIC_API_KEY = 'Place your api key here';
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
