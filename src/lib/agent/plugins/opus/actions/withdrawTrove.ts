import { StarknetAgentInterface } from 'src/lib/agent/tools/tools';
import { WithdrawTroveParams } from '../schemas';
import { createTroveManager } from '../utils/troveManager';

export const withdrawTrove = async (
  agent: StarknetAgentInterface,
  params: WithdrawTroveParams
): Promise<string> => {
  const accountAddress = agent.getAccountCredentials()?.accountPublicKey;

  try {
    const TroveManager = createTroveManager(agent, accountAddress);
    const result = await TroveManager.withdrawTransaction(
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
