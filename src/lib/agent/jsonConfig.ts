import { SystemMessage } from '@langchain/core/messages';

export interface JsonConfig {
  name: string;
  context: string;
  interval: number;
  chat_id: string;
  allowed_tools: string[];
  prompt: SystemMessage;
}

function validateConfig(config: JsonConfig): void {
  const requiredFields = [
    'name',
    'context',
    'interval',
    'chat_id',
    'allowed_tools',
    'prompt',
  ] as const;

  for (const field of requiredFields) {
    if (!config[field as keyof JsonConfig]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  if (
    !Array.isArray(config.allowed_tools) ||
    config.allowed_tools.length === 0
  ) {
    throw new Error('allowed_tools must be a non-empty array');
  }
}

const checkParseJson = (): JsonConfig | undefined => {
  try {
    const json =
      require('../../../config/agents/config-agent.json') as JsonConfig;
    if (!json) {
      throw new Error('wrong json value');
    }
    const systemMessagefromjson = new SystemMessage(json.context.toString());
    json.prompt = systemMessagefromjson;
    validateConfig(json);
    return json;
  } catch (error) {
    console.error('Failed to parse config:', error);
    return undefined;
  }
};

export const load_json_config = (): JsonConfig | undefined => {
  const json = checkParseJson();
  if (!json) {
    return undefined;
  }
  return json;
};
