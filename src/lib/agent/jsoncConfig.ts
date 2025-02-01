import { error } from 'console';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { SystemMessage } from '@langchain/core/messages';

interface JsonConfig {
  name: string;
  context: string;
  mode: string;
  interval: number;
  allowed_tools: string[];
  prompt: ChatPromptTemplate;
}

const checkParseJson = (): JsonConfig | undefined => {
  try {
    const json = require('../../../config-agent.json') as JsonConfig; // Need to really parse the value
    if (!json) {
      throw new Error('wrong json value');
    }
    const systemMessagefromjson = new SystemMessage(json.context.toString());
    const prompt = ChatPromptTemplate.fromMessages([
      systemMessagefromjson,
      ['human', '{input}'],
      ['assistant', '{agent_scratchpad}'],
    ]);
    console.log('interval : ', json.interval);
    console.log(json.allowed_tools);
    console.log(json.mode);
    json.prompt = prompt;
    console.log(prompt);
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
