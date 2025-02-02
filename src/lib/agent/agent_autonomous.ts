import { ChatAnthropic } from '@langchain/anthropic';
import { createAllowedTools } from './tools/tools';
import { AiConfig } from '../utils/types/index.js';
import { ChatOpenAI } from '@langchain/openai';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatOllama } from '@langchain/ollama';
import { StarknetAgentInterface } from 'src/lib/agent/tools/tools';
import { load_json_config } from './jsoncConfig';
import { MemorySaver } from '@langchain/langgraph';
import { createReactAgent } from '@langchain/langgraph/prebuilt';

export const createAutonomousAgent = (
  starknetAgent: StarknetAgentInterface,
  aiConfig: AiConfig
) => {
  // Model factory function
  const createModel = () => {
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
          openAIApiKey: aiConfig.apiKey,
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

  const isSignature = starknetAgent.getSignature().signature === 'wallet';
  const model = createModel();

  try {
    const json_config = load_json_config();

    if (json_config) {
      console.log('JSON config loaded successfully');
      const tools = createAllowedTools(
        starknetAgent,
        json_config.allowed_tools
      );

      console.log('Using default configuration');
      const memory = new MemorySaver();

      const agentConfig = {
        configurable: { thread_id: '43473246237' },
      };

      const agent = createReactAgent({
        llm: model,
        tools,
        checkpointSaver: memory,
        messageModifier: json_config.prompt,
      });

      return { agent, agentConfig };
    }
  } catch (error) {
    console.error('Failed to load or parse JSON config:', error);
  }
};
