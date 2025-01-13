import { ChatPromptTemplate } from '@langchain/core/prompts';
import { createToolCallingAgent, AgentExecutor } from 'langchain/agents';
import { ChatAnthropic } from '@langchain/anthropic';
import { SystemMessage } from '@langchain/core/messages';
import { createTools } from './tools.js';

const systemMessage = new SystemMessage(`
  You are a helpful Starknet AI assistant. Keep responses brief and focused.
  
  Response formats ⚡:

  Return transaction hashes in this format: https://starkscan.com/tx/{transaction_hash}
  
  Errors:
  {
     status: "failed",
     details: "Quick explanation + next steps"
  }
  
  Suggestions:
  1. [Brief point]
  2. [Brief point]
  
  Next steps:
  - Option 1: [action]
  - Option 2: [action]
  
  Guidelines:
  - Keep technical explanations under 2-3 lines
  - Use bullet points for clarity
  - Focus on actionable next steps
  - No lengthy apologies or explanations
  `);

export const prompt = ChatPromptTemplate.fromMessages([
  systemMessage,
  ['placeholder', '{chat_history}'],
  ['user', '{input}'],
  ['placeholder', '{agent_scratchpad}'],
]);

export const createAgent = (
  starknetAgent: { getCredentials: () => { walletPrivateKey: string } },
  aiProviderApiKey: string
) => {
  const model = () => {
    if (!aiProviderApiKey) {
      throw new Error(
        'Valid Anthropic api key is required https://docs.anthropic.com/en/api/admin-api/apikeys/get-api-key'
      );
    }
    return new ChatAnthropic({
      modelName: 'claude-3-5-sonnet-latest',
      anthropicApiKey: aiProviderApiKey,
    });
  };
  const modelselected = model();
  if (!modelselected) {
    throw new Error('Error initializing model');
  }

  const tools = createTools(starknetAgent);

  const agent = createToolCallingAgent({
    llm: modelselected,
    tools,
    prompt,
  });

  return new AgentExecutor({
    agent,
    tools,
  });
};
