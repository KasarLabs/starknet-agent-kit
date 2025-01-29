import { StarknetAgentInterface } from 'src/lib/agent/tools';
import { AtlanticParam } from 'src/lib/utils/types/atlantic';

export const getProofService = async (agent: StarknetAgentInterface, param: AtlanticParam) => {
    try {
      const filename = param.filename;
  
      if (!filename) {
        throw new Error(
          'No filename found.'
        );
      }
        console.log("yoyo")
  
      return JSON.stringify({
        status: 'success',
        response: 'you have call get proof service'
      });
    } catch (error) {
      return JSON.stringify({
        status: 'failure',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
};