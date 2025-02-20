import { SystemMessage } from '@langchain/core/messages';
import { createBox, formatSection } from './formatting';
import chalk from 'chalk';

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
    throw new Error('Error while trying to parse your context from the youragent.json');
  }

  const contextParts: string[] = [];
  let displayOutput = '';

  // Identity Section
  const identityParts: string[] = [];
  if (json.name) {
    identityParts.push(`Name: ${json.name}`);
    contextParts.push(`Your name : [${json.name}]`);
  }
  if (json.bio) {
    identityParts.push(`Bio: ${json.bio}`);
    contextParts.push(`Your Bio : [${json.bio}]`);
  }
  // Identity Section
if (identityParts.length > 0) {
  displayOutput += createBox('IDENTITY', formatSection(identityParts));
}

// Background Section
if (Array.isArray(json.lore)) {
  displayOutput += createBox('BACKGROUND', formatSection(json.lore));
  contextParts.push(`Your lore : [${json.lore.join(']\n[')}]`);
}

// Objectives Section
if (Array.isArray(json.objectives)) {
  displayOutput += createBox('OBJECTIVES', formatSection(json.objectives));
  contextParts.push(`Your objectives : [${json.objectives.join(']\n[')}]`);
}

// Knowledge Section
if (Array.isArray(json.knowledge)) {
  displayOutput += createBox('KNOWLEDGE', formatSection(json.knowledge));
  contextParts.push(`Your knowledge : [${json.knowledge.join(']\n[')}]`);
}

  // Examples Section
  if (Array.isArray(json.messageExamples) || Array.isArray(json.postExamples)) {
    const examplesParts: string[] = [];
    
    if (Array.isArray(json.messageExamples)) {
      examplesParts.push('Message Examples:');
      examplesParts.push(...json.messageExamples);
      contextParts.push(`Your messageExamples : [${json.messageExamples.join(']\n[')}]`);
    }
    
    if (Array.isArray(json.postExamples)) {
      if (examplesParts.length > 0) examplesParts.push('');
      examplesParts.push('Post Examples:');
      examplesParts.push(...json.postExamples);
      contextParts.push(`Your postExamples : [${json.postExamples.join(']\n[')}]`);
    }
    
    if (examplesParts.length > 0) {
      displayOutput += createBox('EXAMPLES', formatSection(examplesParts));
    }
  }

  // Display the formatted output
  console.log(chalk.bold.cyan('\n=== AGENT CONFIGURATION (https://docs.starkagent.ai/customize-your-agent) ==='));
  console.log(displayOutput);

  return contextParts.join('\n');
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
    const systemMessagefromjson = new SystemMessage(createContextFromJson(json));
    
    let jsonconfig: JsonConfig = {} as JsonConfig;
    jsonconfig.prompt = systemMessagefromjson;
    jsonconfig.name = json.name;
    jsonconfig.interval = json.interval;
    jsonconfig.chat_id = json.chat_id;

    if (Array.isArray(json.internal_plugins)) {
      jsonconfig.internal_plugins = json.internal_plugins.map((tool: string) =>
        tool.toLowerCase()
      );
    }
    if (Array.isArray(json.external_plugins)) {
      jsonconfig.external_plugins = json.external_plugins;
    }
    return jsonconfig;
  } catch (error) {
    console.error(
      chalk.red(`⚠️ Ensure your environment variables are set correctly according to your agent.character.json file.`)
    );
    console.error(chalk.red('Failed to parse config:'), error);
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