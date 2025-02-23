import { RpcProvider } from "starknet";
import { SystemMessage } from "@langchain/core/messages";
import TelegramBot from "node-telegram-bot-api";
import { TwitterApi } from 'twitter-api-v2';
import { Scraper } from 'agent-twitter-client';
export interface TwitterApiConfig {
    twitter_api: string;
    twitter_api_secret: string;
    twitter_access_token: string;
    twitter_access_token_secret: string;
    twitter_api_client: TwitterApi;
}
export interface TwitterScraperConfig {
    twitter_client: Scraper;
    twitter_id: string;
    twitter_username: string;
}
export interface TelegramInterface {
    bot_token?: string;
    public_url?: string;
    bot_port?: number;
    bot?: TelegramBot;
}
export interface TwitterInterface {
    twitter_scraper?: TwitterScraperConfig;
    twitter_api?: TwitterApiConfig;
    twitter_auth_mode: 'CREDENTIALS' | 'API';
}
export interface PluginManager {
    telegram_manager?: TelegramInterface;
    twitter_manager?: TwitterInterface;
}
export interface JsonConfig {
    name: string;
    prompt: SystemMessage;
    interval: number;
    chat_id: string;
    internal_plugins: string[];
    external_plugins?: string[];
}
export interface Token {
    symbol: string;
    amount: string;
}
export interface Limit {
    transfer_limit?: Token[];
}
export interface StarknetAgentInterface {
    getAccountCredentials: () => {
        accountPublicKey: string;
        accountPrivateKey: string;
    };
    getModelCredentials: () => {
        aiModel: string;
        aiProviderApiKey: string;
    };
    getSignature: () => {
        signature: string;
    };
    getProvider: () => RpcProvider;
    getLimit: () => Limit;
    getAgentConfig: () => JsonConfig | undefined;
    plugins_manager: PluginManager;
}
