import { StarknetAgentInterface } from 'src/lib/agent/tools/tools';
import { RepayTroveParams } from '../schemas';
import { createTroveManagementService } from '../utils/opus';

export const repayTrove = async (
  agent: StarknetAgentInterface,
  params: RepayTroveParams
): Promise<string> => {
  const accountAddress = agent.getAccountCredentials()?.accountPublicKey;

  try {
    const TroveManagementService = createTroveManagementService(agent, accountAddress);
    const result = await TroveManagementService.repayTransaction(
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
