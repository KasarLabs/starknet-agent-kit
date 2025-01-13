import { ChatPromptTemplate } from '@langchain/core/prompts';
import { createToolCallingAgent, AgentExecutor } from 'langchain/agents';
import { ChatAnthropic } from '@langchain/anthropic';
import { SystemMessage } from '@langchain/core/messages';
import { createTools } from './tools.js';
import { AiConfig } from '../utils/types/index.js';
import { ChatOpenAI } from '@langchain/openai';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatOllama } from '@langchain/ollama';
const systemMessage = new SystemMessage(`
  You are a helpful Starknet AI assistant. Keep responses brief and focused.
  
  Response formats ⚡:

  Return transaction hashes in this format: https://voyager.online/tx/{transaction_hash}
  
  Errors:
  {
     status: "failed",
     details: "Quick explanation + next steps"
  }
  
  Guidelines:
    - Keep technical explanations under 2-3 lines
    - Use bullet points for clarity
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
  aiConfig: AiConfig
) => {
  const model = () => {
    switch (aiConfig.aiModel) {
      case 'anthropic':
        if (!aiConfig.apiKey) {
          throw new Error(
            'Valid Anthropic api key is required https://docs.anthropic.com/en/api/admin-api/apikeys/get-api-key'
          );
        }
        return new ChatOpenAI({
          modelName: aiConfig.aiModel,
          apiKey: aiConfig.apiKey,
        });
      case 'openai':
        if (!aiConfig.apiKey) {
          throw new Error(
            'Valid Openai api key is required https://platform.openai.com/api-keys'
          );
        }
        return new ChatAnthropic({
          modelName: aiConfig.aiModel,
          anthropicApiKey: aiConfig.apiKey,
        });
      case 'gemini':
        if (!aiConfig.apiKey) {
          throw new Error(
            'Valid Gemini api key is required https://ai.google.dev/gemini-api/docs/api-key'
          );
        }
        return new ChatGoogleGenerativeAI({
          modelName: aiConfig.aiModel,
          apiKey: aiConfig.apiKey,
          convertSystemMessageToHumanContent: true,
        });
    }

    return new ChatOllama({
      model: aiConfig.aiModel
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
