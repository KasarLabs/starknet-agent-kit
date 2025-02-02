import { config } from 'dotenv';
import { RpcProvider } from 'starknet';
import { StarknetAgent } from './lib/agent/starknetAgent';
import * as readline from 'readline';

config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function getUserResponse(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

const LocalRun = async () => {
  const response =
    await getUserResponse(`Welcome to starknet-agent-kit choose if you want to run :
    1. Local agent-kit : agent
    2. Autonomous agent : auto\n`);

  const agent = new StarknetAgent({
    provider: new RpcProvider({ nodeUrl: process.env.RPC_URL }),
    accountPrivateKey: process.env.PRIVATE_KEY,
    accountPublicKey: process.env.PUBLIC_ADDRESS,
    aiModel: process.env.AI_MODEL,
    aiProvider: 'anthropic',
    aiProviderApiKey: process.env.AI_PROVIDER_API_KEY,
    signature: 'key',
    agentmode: 'auto',
  });

  console.log(response);

  if (response === `agent`) {
    try {
      console.log('test');
      const input = await getUserResponse(`Agent : how i can help you ?`);
      if (!input) {
        throw new Error('Your input is empty');
      }
      const airesponse = await agent.execute(input);
      console.log(airesponse);
    } catch (error) {
      console.log(error);
    }
  } else if (response === 'auto') {
    try {
      const test = await agent.execute_autonomous();
    } catch (error) {
      console.error('Error:', error);
    }
  }
};

LocalRun().catch(console.error);
