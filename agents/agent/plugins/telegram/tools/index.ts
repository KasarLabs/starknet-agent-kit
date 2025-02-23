import { StarknetToolRegistry } from 'agents/agent/tools/tools';
import { telegram_get_messages_from_conversation } from '../actions/telegram';
import { getTelegramMessageUpdateFromConversationSchema } from '../schema';

export const registerTelegramTools = () => {
  StarknetToolRegistry.registerTool({
    name: 'telegram_get_messages_from_conversation',
    plugins: 'telegram',
    description: 'Get the lates messages of telegram channel',
    schema: getTelegramMessageUpdateFromConversationSchema,
    execute: telegram_get_messages_from_conversation,
  });
};
