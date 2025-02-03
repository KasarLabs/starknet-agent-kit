import { StarknetAgentInterface } from 'src/lib/agent/tools/tools';
import { AtlanticParam, AtlanticRes } from './types/Atlantic';
import { ATLANTIC_URL } from 'src/core/constants/infra/atlantic';
import { promises as fs } from 'fs';
import { ValidationError, NotFoundError } from 'src/common/errors/application.errors';
import { validateJson } from './utils/validateJson'


/**
 * Verifies a proof using the Atlantic service.
 * 
 * @param agent - The Starknet agent interface.
 * @param param - The Atlantic parameters, including the filename.
 * @returns A Promise that resolves to a JSON string containing the status and URL or error message.
 */
export const verifyProofService = async (agent: StarknetAgentInterface, param: AtlanticParam) => {
  try {
    const filename = param.filename;
    if (!filename) {
      throw new 
        NotFoundError('Filename is empty.')
      ;
    }
    let buffer;
    try {
        buffer = await fs.readFile(`./uploads/${filename}`, 'utf8');
        if (!validateJson(buffer)) {
            throw new ValidationError("The file isn't an json type.");
        }
    } catch(error) {
        throw new Error(error.message);
    }

    const formData = new FormData();
    formData.append('proofFile', new Blob([JSON.stringify(buffer)], {type: 'application/json'}), filename);
    formData.append('mockFactHash', 'false');
    formData.append('stoneVersion', 'stone6');
    formData.append('memoryVerification', 'cairo1');

    const apiKey = process.env.ATLANTIC_API_KEY;
    const res = await fetch(`${ATLANTIC_URL}/v1/l2/atlantic-query/proof-verification?apiKey=${apiKey}`, {
        method: 'POST',
        headers: {
            'accept': 'application/json'
        },
        body: formData
    });
    let url;
    if (res.status){
        const data: AtlanticRes = await res.json()
        url = `https://staging.dashboard.herodotus.dev/explorer/atlantic/${data.atlanticQueryId}`;
    }

    return JSON.stringify({
      status: 'success',
      url: url
    });
  } catch (error) {

    return JSON.stringify({
      status: 'failure',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};