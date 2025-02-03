import { ATLANTIC_URL } from 'src/core/constants/infra/atlantic';
import { StarknetAgentInterface } from 'src/lib/agent/tools/tools';
import { AtlanticParam } from 'src/lib/utils/types/atlantic';
import { promises as fs } from 'fs';

interface AtlanticRes {
    atlanticQueryId: string;
}

/**
 * Validates if the given buffer contains a valid ZIP file signature.
 * 
 * @param buffer - The Buffer object to be validated as a ZIP file.
 * @returns A Promise that resolves to true if the buffer starts with a valid ZIP signature, false otherwise.
 */
const validateZip = async (buffer: Buffer) => {
    const zipSignature = [0x50, 0x4B, 0x03, 0x04];
    if (buffer.length < zipSignature.length) {
        return false;
    }
    return zipSignature.every((byte, index) => buffer[index] === byte);
}

/**
 * Handles proof generation by sending a ZIP file to the Atlantic API.
 * 
 * @param agent - The Starknet agent interface.
 * @param param - The Atlantic parameters, including the filename.
 * @returns A Promise that resolves to a JSON string containing the status and URL or an error message.
 */
export const getProofService = async (agent: StarknetAgentInterface, param: AtlanticParam) => {
    try {
        const filename = param.filename;
        if (!filename) {
          throw new Error(
            'No filename found.'
          );
        }
        let buffer;
        try {
            buffer = await fs.readFile(`./uploads/${filename}`);
            if (!validateZip(buffer)) {
                throw new Error('Is not a zip file.');
            }
        } catch(error) {
            throw new Error(error.message);
        }
    
        const formData = new FormData();
        console.log(new Blob([buffer]))
        formData.append('pieFile', new Blob([buffer], {type: 'application/zip'}), filename);
        formData.append('layout', 'recursive');
        formData.append('prover', 'starkware_sharp');
    
        const apiKey = process.env.ATLANTIC_API_KEY;
        const res = await fetch(`${ATLANTIC_URL}/v1/proof-generation?apiKey=${apiKey}`, {
            method: 'POST',
            headers: {
                'accept': 'application/json'
            },
            body: formData
        })
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