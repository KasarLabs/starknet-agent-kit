import { SystemMessage } from '@langchain/core/messages';

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
  internal_plugins: string[];
  external_plugins?: string[];
}

const createContextFromJson = (json: any): string => {
  if (!json) {
    throw new Error(
      'Error while trying to parse yout context from the youragent.json'
    );
  }
  const contextParts: string[] = [];
  if (json.name) {
    contextParts.push(`Your name : [${json.name}]`);
  }
  if (json.bio) {
    contextParts.push(`Your Bio : [${json.bio}]`);
  }
  if (Array.isArray(json.lore)) {
    const lore: string = json.lore.join(']\n[');
    contextParts.push(`Your lore : [${lore}]`);
  }
  if (Array.isArray(json.objectives)) {
    const objectives: string = json.objectives.join(']\n[');
    contextParts.push(`Your objectives : [${objectives}]`);
  }
  if (Array.isArray(json.knowledge)) {
    const knowledge: string = json.knowledge.join(']\n[');
    contextParts.push(`Your knowledge : [${knowledge}]`);
  }
  if (Array.isArray(json.messageExamples)) {
    const messageExamples: string = json.messageExamples.join(']\n[');
    contextParts.push(`Your messageExamples : [${messageExamples}]`);
  }
  if (Array.isArray(json.postExamples)) {
    const postExamples: string = json.postExamples.join(']\n[');
    contextParts.push(`Your postExamples : [${postExamples}]`);
  }
  const context = contextParts.join('\n');
  console.log(`AI context = ${context}`);
  return context;
};

const validateConfig = (config: JsonConfig) => {
  const requiredFields = [
    'name',
    'interval',
    'chat_id',
    'bio',
    'internal_plugins',
  ] as const;

  for (const field of requiredFields) {
    if (!config[field as keyof JsonConfig]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
};

const checkParseJson = (agent_config_name: string): JsonConfig | undefined => {
  try {
    const json = require(`../../../config/agents/${agent_config_name}`);
    if (!json) {
      throw new Error(`Can't access to ./config/agents/config-agent.json`);
    }
    validateConfig(json);
    const systemMessagefromjson = new SystemMessage(
      createContextFromJson(json)
    );
    let jsonconfig: JsonConfig = {} as JsonConfig;
    jsonconfig.prompt = systemMessagefromjson;
    jsonconfig.name = json.name;
    jsonconfig.prompt = systemMessagefromjson;
    jsonconfig.interval = json.interval;
    jsonconfig.chat_id = json.chat_id;

    if (Array.isArray(json.internal_plugins)) {
      jsonconfig.internal_plugins = json.internal_plugins;
      jsonconfig.internal_plugins = jsonconfig.internal_plugins.map((tool) =>
        tool.toLowerCase()
      );
    }
    if (Array.isArray(json.external_plugins)) {
      jsonconfig.external_plugins = json.external_plugins;
    }
    return jsonconfig;
  } catch (error) {
    console.error(
      `⚠️ Ensure your environment variables are set correctly according to your agent.character.json file.`
    );
    console.error('Failed to parse config:', error);
    return undefined;
  }
};

export const load_json_config = (
  agent_config_name: string
): JsonConfig | undefined => {
  const json = checkParseJson(agent_config_name);
  if (!json) {
    return undefined;
  }
  return json;
};
