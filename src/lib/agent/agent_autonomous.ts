import { ChatAnthropic } from '@langchain/anthropic';
import { createAllowedTools } from './tools/tools';
import { AiConfig } from './method/core/account/types/accounts';
import { ChatOpenAI } from '@langchain/openai';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatOllama } from '@langchain/ollama';
import { StarknetAgentInterface } from 'src/lib/agent/tools/tools';
import { load_json_config } from './jsonConfig';
import { MemorySaver } from '@langchain/langgraph';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { createAllowedToollkits } from './tools/external_tools';

export const createAutonomousAgent = (
  starknetAgent: StarknetAgentInterface,
  aiConfig: AiConfig
) => {
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

  const model = createModel();

  try {
    const json_config = load_json_config();

    if (json_config) {
      console.log('JSON config loaded successfully');

      const allowedTools = createAllowedTools(
        starknetAgent,
        json_config.allowed_internal_tools
      );
      const allowedToolsKits = createAllowedToollkits(
        json_config.external_toolkits,
        json_config.allowed_external_tool
      );

      const tools = [...allowedTools, ...allowedToolsKits];
      const memory = new MemorySaver();
      const agentConfig = {
        configurable: { thread_id: json_config.chat_id },
      };

      const agent = createReactAgent({
        llm: model,
        tools: tools,
        checkpointSaver: memory,
        messageModifier: json_config.prompt,
      });

      return { agent, agentConfig, json_config };
    }
  } catch (error) {
    console.error('Failed to load or parse JSON config:', error);
  }
};
