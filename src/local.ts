import { config } from 'dotenv';
import { RpcProvider } from "starknet";
import { StarknetAgent } from "./lib/agent/starknetAgent";

config();

const LocalRun = async() => {
    try {
        const agent = new StarknetAgent({
            provider : new RpcProvider({nodeUrl : process.env.RPC_URL}),
            accountPrivateKey : process.env.PRIVATE_KEY,
            accountPublicKey : process.env.PUBLIC_ADDRESS,
            aiModel : process.env.AI_MODEL,
            aiProvider : 'anthropic',
            aiProviderApiKey : process.env.AI_PROVIDER_API_KEY,
            signature : 'key'
        });

        const test = await agent.execute_autonomous();
        console.log(test)
    } catch (error) {
        console.error("Error:", error);
    }
}

LocalRun().catch(console.error);