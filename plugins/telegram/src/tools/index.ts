import {
  StarknetAgentInterface,
  StarknetToolRegistry,
} from '@starknet-agent-kit/agent';
import { telegram_get_messages_from_conversation } from '../actions/telegram';
import { getTelegramMessageUpdateFromConversationSchema } from '../schema';
import TelegramBot from 'node-telegram-bot-api';
import { TelegramInterface } from '../interfaces';

export const initializeTelegramManager = (agent: StarknetAgentInterface) => {
  try {
    const bot_token = process.env.TELEGRAM_BOT_TOKEN;
    agent.plugins_manager.telegram_manager = {};
    if (!bot_token) {
      throw new Error(`TELEGRAM_BOT_TOKEN is not set in your .env`);
    }
    const public_url = process.env.TELEGRAM_PUBLIC_URL;
    if (!public_url) {
      throw new Error(`TELEGRAM_PUBLIC_URL is not set in your .env`);
    }
    const bot_port: number = parseInt(
      process.env.TELEGRAM_BOT_PORT as string,
      10
    );
    if (isNaN(bot_port)) {
      throw new Error('TELEGRAM_BOT_PORT must be a valid number');
    }

    const bot = new TelegramBot(bot_token, {
      webHook: { port: bot_port },
    });
    if (!bot) {
      throw new Error(`Error trying to set your bot`);
    }

    const TelegramInterfaces: TelegramInterface = {
      bot_token: bot_token,
      public_url: public_url,
      bot_port: bot_port,
      bot: bot,
    };

    agent.plugins_manager.telegram_manager = TelegramInterfaces;
  } catch (error) {
    console.log(error);
    return;
  }
};

export const getTelegramManager = (agent: StarknetAgentInterface) => {
  return agent.plugins_manager.telegram_manager;
};

export const registerTelegramTools = (agent: StarknetAgentInterface) => {
  initializeTelegramManager(agent);
  StarknetToolRegistry.registerTool({
    name: 'telegram_get_messages_from_conversation',
    plugins: 'telegram',
    description: 'Get the lates messages of telegram channel',
    schema: getTelegramMessageUpdateFromConversationSchema,
    execute: telegram_get_messages_from_conversation,
  });
};
