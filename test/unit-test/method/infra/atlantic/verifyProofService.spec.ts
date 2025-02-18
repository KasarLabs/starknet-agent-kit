import { VerifierParam } from 'src/lib/agent/plugins/atlantic/types/Atlantic';
import { verifyProofService } from 'src/lib/agent/plugins/atlantic/actions/verifyProofService';
import { createMockStarknetAgent } from 'test/jest/setEnvVars';

const agent = createMockStarknetAgent();

describe('verifyProofService', () => {
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
    const getProofParam: VerifierParam = {
      filename: '/test/recursive_proof.json',
      memoryVerification: 'relaxed',
    };

    const result = await verifyProofService(agent, getProofParam);
    const parsed = JSON.parse(result);

    expect(parsed).toEqual({
      status: 'success',
      url: expect.any(String),
    });
  });
  describe('With no filename input', () => {});
  it('Invalid Type', async () => {
    process.env.ATLANTIC_API_KEY = 'Place your api key here';
    const getProofParam: VerifierParam = {
      filename: '/test/Pie.zip',
      memoryVerification: 'relaxed',
    };

    const result = await verifyProofService(agent, getProofParam);
    const parsed = JSON.parse(result);

    expect(parsed).toEqual({
      status: 'failure',
      error: expect.any(String),
    });
  });
  it('Invalid filename', async () => {
    process.env.ATLANTIC_API_KEY = 'Place your api key here';
    const getProofParam: VerifierParam = {
      filename: 'sfddfds',
      memoryVerification: 'relaxed',
    };

    const result = await verifyProofService(agent, getProofParam);
    const parsed = JSON.parse(result);

    expect(parsed).toEqual({
      status: 'failure',
      error: expect.any(String),
    });
  });
});
