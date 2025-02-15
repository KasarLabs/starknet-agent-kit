import { StarknetAgentInterface } from 'src/lib/agent/tools/tools';
import { OpenTroveParams } from '../schemas';
import { createTroveManagementService } from '../utils/opus';

export const openTrove = async (
  agent: StarknetAgentInterface,
  params: OpenTroveParams
): Promise<string> => {
  const accountAddress = agent.getAccountCredentials()?.accountPublicKey;

  try {
    const TroveManagementService = createTroveManagementService(agent, accountAddress);
    const result = await TroveManagementService.openTroveTransaction(
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
