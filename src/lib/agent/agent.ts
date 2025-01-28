import { ChatPromptTemplate } from '@langchain/core/prompts';
import { createToolCallingAgent, AgentExecutor } from 'langchain/agents';
import { ChatAnthropic } from '@langchain/anthropic';
import { SystemMessage } from '@langchain/core/messages';
import { createTools } from './tools/tools';
import { AiConfig } from '../utils/types/index.js';
import { ChatOpenAI } from '@langchain/openai';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatOllama } from '@langchain/ollama';
import { StarknetAgentInterface } from 'src/lib/agent/tools/tools';
import { createCalldataTools } from './tools/call_data.tools';

const systemMessage = new SystemMessage(`
  You are an AI agent on Starknet network capable of executing all kinds of transactions and interacting with the Starknet blockchain.
  
  You are able to execute transactions on behalf of the user. 

  When you execute a swap function successfully always mention the explorer link https://starkscan.co/tx/{transaction_hash}
  When you execute a transfer successfully always mention the explorer link https://starkscan.co/tx/{transaction_hash}

  When displaying a balance value, if its a USDT or USDC do a padding of 6 decimal otherwise do a 18 decimal padding.
  
  If the transaction was unsuccessful, return the response in the following format, followed by an explanation if any known:
  The transaction failed: {error_message}
  
  Please beautify any of your responses by adding returns to make it more readable.
`);

export const prompt = ChatPromptTemplate.fromMessages([
  systemMessage,
  ['human', '{input}'],
  ['assistant', '{agent_scratchpad}'],
]);

export const createAgent = (
  starknetAgent: StarknetAgentInterface,
  aiConfig: AiConfig
) => {
  const isCalldataMode =
    starknetAgent.getAgentMode().agent_mode === 'call_data';
  const model = () => {
    switch (aiConfig.aiProvider) {
      case 'anthropic':
        if (!aiConfig.apiKey) {
          throw new Error(
            'Valid Anthropic api key is required https://docs.anthropic.com/en/api/admin-api/apikeys/get-api-key'
          );
        }
        return new ChatAnthropic({
          modelName: aiConfig.aiModel,
          anthropicApiKey: aiConfig.apiKey,
        });
      case 'openai':
        if (!aiConfig.apiKey) {
          throw new Error(
            'Valid OpenAI api key is required https://platform.openai.com/api-keys'
          );
        }
        return new ChatOpenAI({
          modelName: aiConfig.aiModel,
          apiKey: aiConfig.apiKey,
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
      case 'ollama':
        return new ChatOllama({
          model: aiConfig.aiModel,
        });
      default:
        throw new Error(`Unsupported AI provider: ${aiConfig.aiProvider}`);
    }
  };

  const modelSelected = model();
  const tools = isCalldataMode
    ? createCalldataTools()
    : createTools(starknetAgent);

  const agent = createToolCallingAgent({
    llm: modelSelected,
    tools,
    prompt,
  });

  const executorConfig = {
    agent,
    tools,
    ...(isCalldataMode && {
      returnIntermediateSteps: true,
      maxIterations: 1,
    }),
  };

  return new AgentExecutor(executorConfig);
};
