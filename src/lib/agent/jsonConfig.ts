import { SystemMessage } from '@langchain/core/messages';
import { num } from 'starknet';

export interface Token {
  symbol: string;
  amount: number;
}

export interface Transfer_limit {
  token: Token[];
}

export interface JsonConfig {
  name: string;
  prompt: SystemMessage;
  interval: number;
  chat_id: string;
  allowed_internal_tools: string[];
  external_toolkits?: string[];
  allowed_external_tools?: string[];
}

function validateConfig(config: JsonConfig): void {
  const requiredFields = [
    'name',
    'interval',
    'chat_id',
    'allowed_internal_tools',
    'context',
  ] as const;

  for (const field of requiredFields) {
    if (!config[field as keyof JsonConfig]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  if (
    !Array.isArray(config.allowed_internal_tools) ||
    config.allowed_internal_tools.length === 0
  ) {
    throw new Error('allowed_internal_tools must be a non-empty array');
  }
}

const checkParseJson = (): JsonConfig | undefined => {
  try {
    const json = require('../../../config/agents/config-agent.json');
    if (!json) {
      throw new Error(`Can't access to ./config/agents/config-agent.json`);
    }
    validateConfig(json);
    const systemMessagefromjson = new SystemMessage(json.context.toString());
    let jsonconfig: JsonConfig = {} as JsonConfig;
    jsonconfig.prompt = systemMessagefromjson;
    jsonconfig.name = json.name;
    jsonconfig.prompt = systemMessagefromjson;
    jsonconfig.interval = json.interval;
    jsonconfig.chat_id = json.chat_id;
    jsonconfig.allowed_internal_tools = json.allowed_internal_tools;

    if (Array.isArray(json.external_toolkits)) {
      jsonconfig.external_toolkits = json.external_toolkits;
    }
    if (Array.isArray(json.allowed_external_tools)) {
      jsonconfig.allowed_external_tools;
    }
    return jsonconfig;
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
