import { StarknetAgentInterface } from "src/lib/agent/tools/tools";
import { PlacePixelParam } from "../types/PlacePixelParam";
import { Account, Contract } from "starknet";
import { artpeaceAbi } from "../abis/artpeaceAbi";
import { artpeaceAddr } from "../constants/artpeace";
import { Checker } from "../utils/checker";

export const placePixel = async (agent: StarknetAgentInterface, input: { params: PlacePixelParam[] }) => {
    try {
        const { params } = input;
        const credentials = agent.getAccountCredentials();
        const provider = agent.getProvider();
        const timestamp = Math.floor(Date.now() / 1000); // time in second
        const account = new Account(provider, credentials.accountPublicKey, credentials.accountPrivateKey);       
        const artpeaceContract = new Contract(artpeaceAbi, artpeaceAddr, provider);
        
        const callData = await Promise.all(params.map( async (param) => {
            console.log(param.color);
            const checker = new Checker(param.canvasId);
            const id = await checker.checkWorld();
            const position = await checker.checkPosition(param.xPos, param.yPos);
            const color = await checker.checkColor(param.color);
            
            artpeaceContract.connect(account);
            return artpeaceContract.populate("place_pixel", {
                canvas_id: id,
                pos: position,
                color: color,
                now: timestamp,
            });
        }));

        const res = await account.execute(callData);
        await provider.waitForTransaction(res.transaction_hash);

        return JSON.stringify({
            status: 'success',
            transaction_hash: res.transaction_hash,
        });
    } catch (error) {
        console.log(error);
        return JSON.stringify({
            status: 'error',
            error: {
                code: 'PLACE_PIXEL_DATA_ERROR',
                message: error.message || 'Failed to place a pixel',
            },
        });
    }
}

export const placePixelSignature = async (input: { params: PlacePixelParam[] }) => {
   try { 
        const { params } = input;
        const timestamp = Math.floor(Date.now() / 1000);
        const artpeaceContract = new Contract(artpeaceAbi, artpeaceAddr);

        const callData = await Promise.all(params.map( async (param) => {
            const checker = new Checker(param.canvasId);
            const id = await checker.checkWorld();
            const position = await checker.checkPosition(param.xPos, param.yPos);
            // const color = await checker.checkColor(param.color);
            
            const call =  artpeaceContract.populate("place_pixel", {
                canvas_id: id,
                pos: position,
                color: param.color,
                now: timestamp,
            });

            console.log(call);
            return {
                status: 'success',
                transactions: {
                    ...call
                },
            };
        }));
        return JSON.stringify({ transaction_type: 'INVOKE', callData });
    } catch (error) {
        console.log(error);
            return {
            status: 'error',
            error: {
              code: 'PLACE_PIXEL_CALL_DATA_ERROR',
              message: error.message || 'Failed to generate place_pixel call data',
            },
        };
    }
}