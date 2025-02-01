import { ChatPromptTemplate } from '@langchain/core/prompts';
import { createToolCallingAgent, AgentExecutor } from 'langchain/agents';
import { ChatAnthropic } from '@langchain/anthropic';
import { SystemMessage } from '@langchain/core/messages';
import { createTools, createAllowedTools } from './tools/tools';
import { AiConfig } from '../utils/types/index.js';
import { ChatOpenAI } from '@langchain/openai';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatOllama } from '@langchain/ollama';
import { StarknetAgentInterface } from 'src/lib/agent/tools/tools';
import { createSignatureTools } from './tools/signature_tools';
import { load_json_config } from './jsoncConfig';

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
  ['human', '{input}'],
  ['assistant', '{agent_scratchpad}'],
]);

export const createAgent = (
  starknetAgent: StarknetAgentInterface,
  aiConfig: AiConfig
) => {
  const isSignature = starknetAgent.getSignature().signature === 'wallet';
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

  const json_config = load_json_config();
  if (json_config) {
    console.log('json_model_load is succesfull');
    const modelSelected = model();
    const tools = isSignature
      ? createSignatureTools()
      : createAllowedTools(starknetAgent,json_config.allowed_tools);
    const agent = createToolCallingAgent({
      llm: modelSelected,
      tools,
      prompt: json_config.prompt,
    });

    const executorConfig = {
      agent,
      tools,
      ...(isSignature && {
        returnIntermediateSteps: true,
        maxIterations: 1,
      }),
    };

    return new AgentExecutor(executorConfig);
  }
  console.log('Error : failed to parse json file !');
  const modelSelected = model();
  const tools = isSignature
    ? createSignatureTools()
    : createTools(starknetAgent);

  const agent = createToolCallingAgent({
    llm: modelSelected,
    tools,
    prompt,
  });

  const executorConfig = {
    agent,
    tools,
    ...(isSignature && {
      returnIntermediateSteps: true,
      maxIterations: 1,
    }),
  };

  return new AgentExecutor(executorConfig);
};

