import { StarknetAgentInterface } from 'src/lib/agent/tools/tools';
import { BorrowTroveParams } from '../schemas';
import { createTroveManagementService } from '../utils/opus';

export const borrowTrove = async (
  agent: StarknetAgentInterface,
  params: BorrowTroveParams
): Promise<string> => {
  const accountAddress = agent.getAccountCredentials()?.accountPublicKey;

  try {
    const TroveManagementService = createTroveManagementService(agent, accountAddress);
    const result = await TroveManagementService.borrowTransaction(
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
