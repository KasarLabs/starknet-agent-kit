import { StarknetAgentInterface } from 'src/lib/agent/tools/tools';
import { GetTroveHealthParams, GetUserTrovesParams } from '../schemas';
import { createTroveManager } from '../utils/troveManager';

export const getUserTroves = async (
  agent: StarknetAgentInterface,
  params: GetUserTrovesParams
): Promise<string> => {
  const accountAddress = agent.getAccountCredentials()?.accountPublicKey;

  try {
    const TroveManager = createTroveManager(agent, accountAddress);
    const result = await TroveManager.getUserTroves(
      params,
      agent
    );
    return JSON.stringify({
      status: "success",
      data: result,
    });
  } catch (error) {
    return JSON.stringify({
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getTroveHealth = async (
  agent: StarknetAgentInterface,
  params: GetTroveHealthParams
): Promise<string> => {
  const accountAddress = agent.getAccountCredentials()?.accountPublicKey;

  try {
    const TroveManager = createTroveManager(agent, accountAddress);
    const result = await TroveManager.getTroveHealth(
      params,
      agent
    );
    return JSON.stringify({
      status: "success",
      data: result,
    });
  } catch (error) {
    return JSON.stringify({
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
