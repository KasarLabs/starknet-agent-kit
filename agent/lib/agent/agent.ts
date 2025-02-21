import { ChatAnthropic } from '@langchain/anthropic';
import { SystemMessage } from '@langchain/core/messages';
import { createTools } from './tools/tools';
import { AiConfig } from '@starknet-agent-kit/core/src/account/types/accounts';
import { ChatOpenAI } from '@langchain/openai';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatOllama } from '@langchain/ollama';
import { StarknetAgentInterface } from '@starknet-agent-kit/agent';
import { createSignatureTools } from './tools/signatureTools';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { createAllowedToollkits } from './tools/external_tools';
import { createAllowedTools } from './tools/tools';

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
export const createAgent = async (
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
  try {
    const modelSelected = model();
    const json_config = starknetAgent.getAgentConfig();
    if (json_config) {
      console.log('Character config loaded successfully');
      console.log('JSON config loaded successfully');

      const allowedTools = await createAllowedTools(
        starknetAgent,
        json_config.internal_plugins
      );

      const allowedToolsKits = json_config.external_plugins
        ? createAllowedToollkits(json_config.external_plugins)
        : null;

      const tools = allowedToolsKits
        ? [...allowedTools, ...allowedToolsKits]
        : allowedTools;
      console.log(tools.length);
      const agent = createReactAgent({
        llm: modelSelected,
        tools,
        messageModifier: systemMessage,
      });

      return agent;
    }
    const tools = isSignature
      ? createSignatureTools()
      : createTools(starknetAgent);

    const agent = createReactAgent({
      llm: modelSelected,
      tools,
      messageModifier: systemMessage,
    });

    return agent;
  } catch (error) {
    console.error(
      `⚠️ Ensure your environment variables are set correctly according to your agent.character.json file.`
    );
    console.error('Failed to load or parse JSON config:', error);
  }
};
