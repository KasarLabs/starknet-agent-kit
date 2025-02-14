import { ChatAnthropic } from '@langchain/anthropic';
import { SystemMessage } from '@langchain/core/messages';
import { createTools } from './tools/tools';
import { AiConfig } from './plugins/core/account/types/accounts.js';
import { ChatOpenAI } from '@langchain/openai';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatOllama } from '@langchain/ollama';
import { StarknetAgentInterface } from 'src/lib/agent/tools/tools';
import { createSignatureTools } from './tools/signatureTools';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { createAllowedToollkits } from './tools/external_tools';
import { createAllowedTools } from './tools/tools';
import { uuid } from 'uuidv4';
import { MemorySaver } from '@langchain/langgraph';
import { JsonConfig } from './jsonConfig';

export type AgentConfig = {
  agent: any;
  agentConfig?: any;
  json_config?: JsonConfig;
};
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
  try {
    const modelSelected = model();
    let memory_id = null;
    const memory = new MemorySaver();

    const json_config = starknetAgent.getAgentConfig();
    if (json_config) {
      console.log('Character config loaded successfully');
      console.log('JSON config loaded successfully');

      if (starknetAgent.getAgentMemory().agentMemory === true) {
        memory_id = uuid().toString();
      }
      const allowedTools = createAllowedTools(
        starknetAgent,
        json_config.internal_plugins
      );

      const allowedToolsKits = json_config.external_plugins
        ? createAllowedToollkits(json_config.external_plugins)
        : null;

      const tools = allowedToolsKits
        ? [...allowedTools, ...allowedToolsKits]
        : allowedTools;

      const agentConfig = {
        configurable: { thread_id: memory_id },
      };

      let agent;
      if (memory_id === null) {
        agent = createReactAgent({
          llm: modelSelected,
          tools,
          messageModifier: systemMessage,
        });
      } else {
        agent = createReactAgent({
          llm: modelSelected,
          tools,
          messageModifier: systemMessage,
          checkpointSaver: memory,
        });
      }

      if (memory_id != null) {
        const result: AgentConfig = {
          agent: agent,
          agentConfig: agentConfig,
          json_config: json_config,
        };
        return result;
      }
      const result: AgentConfig = {
        agent: agent,
      };
      return result;
    }

    if (starknetAgent.getAgentMemory().agentMemory === true) {
      memory_id = uuid().toString();
    }

    const agentConfig = {
      configurable: { thread_id: memory_id },
    };

    const tools = isSignature
      ? createSignatureTools()
      : createTools(starknetAgent);

    const agent = createReactAgent({
      llm: modelSelected,
      tools,
      messageModifier: systemMessage,
      checkpointSaver: memory,
    });

    if (memory_id != null) {
      const result: AgentConfig = {
        agent: agent,
        agentConfig: agentConfig,
      };
      return result;
    }
    const result: AgentConfig = {
      agent: agent,
    };
    return result;
  } catch (error) {
    console.error(
      `⚠️ Ensure your environment variables are set correctly according to your agent.character.json file.`
    );
    console.error('Failed to load or parse JSON config:', error);
  }
};
