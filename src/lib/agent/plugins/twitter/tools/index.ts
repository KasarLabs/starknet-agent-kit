import {
  StarknetAgentInterface,
  StarknetToolRegistry,
} from 'src/lib/agent/tools/tools';

import {
  createTwitterpostSchema,
  createAndPostTwitterThreadSchema,
  ReplyTweetSchema,
  getLastTweetsAndRepliesFromUserSchema,
  getLastTweetsOptionsSchema,
  FollowXUserFromUsernameSchema,
  getTwitterProfileFromUsernameSchema,
  getTwitterUserIdFromUsernameSchema,
  getLastTweetsFromUserSchema,
  getLastUserXTweetSchema,
} from '../schema';

import {
  createTwitterpost,
  ReplyTweet,
  createAndPostTwitterThread,
  FollowXUserFromUsername,
} from '../actions/twitter';
import {
  getLastUserTweet,
  getLastTweetsOptions,
  getOwnTwitterAccountInfo,
  getLastTweetsFromUser,
  getLastTweetsAndRepliesFromUser,
  getTwitterUserIdFromUsername,
  getTwitterProfileFromUsername,
} from '../actions/twitter_read';
import { Scraper } from 'agent-twitter-client';
import { TwitterApiConfig, TwitterScraperConfig } from '../interfaces';
import { TwitterApi } from 'twitter-api-v2';

const initializeTwitterManager = async (
  agent: StarknetAgentInterface
): Promise<void> => {
  const auth_mode = process.env.TWITTER_AUTH_MODE;
  try {
    if (auth_mode === 'CREDENTIALS') {
      agent.plugins_manager.twitter_manager = {
        twitter_auth_mode: 'CREDENTIALS',
      };
      console.log('CREDENTIALS');
      const username = process.env.TWITTER_USERNAME;
      const password = process.env.TWITTER_PASSWORD;
      const email = process.env.TWITTER_EMAIL;

      if (!username || !password) {
        throw new Error(
          'Error when try to initializeTwitterManager in CREDENTIALS twitter_auth_mode check your .env'
        );
      }
      const user_client = new Scraper();

      await user_client.login(username, password, email);
      console.log('user_client', user_client);
      const account = await user_client.me();
      console.log('account', account);
      if (!account) {
        throw new Error('Impossible to get your twitter account information');
      }
      const userClient: TwitterScraperConfig = {
        twitter_client: user_client,
        twitter_id: account?.userId as string,
        twitter_username: account?.username as string,
      };
      agent.plugins_manager.twitter_manager.twitter_scraper = userClient;
    } else if (auth_mode === 'API') {
      agent.plugins_manager.twitter_manager = { twitter_auth_mode: 'API' };
      const twitter_api = process.env.TWITTER_API;
      const twitter_api_secret = process.env.TWITTER_API_SECRET;
      const twitter_access_token = process.env.TWITTER_ACCESS_TOKEN;
      const twitter_access_token_secret =
        process.env.TWITTER_ACCESS_TOKEN_SECRET;

      if (
        !twitter_api ||
        !twitter_api_secret ||
        !twitter_access_token ||
        !twitter_access_token_secret
      ) {
        throw new Error(
          'Error when try to initializeTwitterManager in API twitter_auth_mode check your .env'
        );
      }

      const userClient = new TwitterApi({
        appKey: twitter_api,
        appSecret: twitter_api_secret,
        accessToken: twitter_access_token,
        accessSecret: twitter_access_token_secret,
      });
      if (!userClient) {
        throw new Error(
          'Error when trying to createn you Twitter API Account check your API Twitter CREDENTIALS'
        );
      }

      const apiConfig: TwitterApiConfig = {
        twitter_api: twitter_api,
        twitter_api_secret: twitter_api_secret,
        twitter_access_token: twitter_access_token,
        twitter_access_token_secret: twitter_access_token_secret,
        twitter_api_client: userClient,
      };

      agent.plugins_manager.twitter_manager.twitter_api = apiConfig;
    } else {
      throw new Error(`Invalid auth_mode: ${auth_mode}`);
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const registerTwitterTools = async (agent: StarknetAgentInterface) => {
  // Twitter Tools
  console.log('Hello from Twitter Tools');
  await initializeTwitterManager(agent);
  console.log('Hello from Twitter Tools 2');
  StarknetToolRegistry.registerTool({
    name: 'create_twitter_post',
    plugins: 'twitter',
    description: 'Create new X/Twitter post',
    schema: createTwitterpostSchema,
    execute: createTwitterpost,
  });

  StarknetToolRegistry.registerTool({
    name: 'reply_twitter_tweet',
    plugins: 'twitter',
    description: 'Reply to specific X/Twitter post by ID',
    schema: ReplyTweetSchema,
    execute: ReplyTweet,
  });

  StarknetToolRegistry.registerTool({
    name: 'get_last_tweet',
    plugins: 'twitter',
    description: 'Get most recent post from specified X/Twitter account',
    schema: getLastUserXTweetSchema,
    execute: getLastUserTweet,
  });

  StarknetToolRegistry.registerTool({
    name: 'get_last_tweets_options',
    plugins: 'twitter',
    description: 'Get specified number of posts matching search query',
    schema: getLastTweetsOptionsSchema,
    execute: getLastTweetsOptions,
  });

  StarknetToolRegistry.registerTool({
    name: 'create_and_post_twitter_thread',
    plugins: 'twitter',
    description: 'Create and publish X/Twitter thread',
    schema: createAndPostTwitterThreadSchema,
    execute: createAndPostTwitterThread,
  });

  StarknetToolRegistry.registerTool({
    name: 'follow_twitter_from_username',
    plugins: 'twitter',
    description: 'Follow X/Twitter user by username',
    schema: FollowXUserFromUsernameSchema,
    execute: FollowXUserFromUsername,
  });

  StarknetToolRegistry.registerTool({
    name: 'get_twitter_profile_from_username',
    plugins: 'twitter',
    description: 'Get full X/Twitter profile data by username',
    schema: getTwitterProfileFromUsernameSchema,
    execute: getTwitterProfileFromUsername,
  });

  StarknetToolRegistry.registerTool({
    name: 'get_twitter_user_id_from_username',
    plugins: 'twitter',
    description: 'Get X/Twitter user ID from username',
    schema: getTwitterUserIdFromUsernameSchema,
    execute: getTwitterUserIdFromUsername,
  });

  StarknetToolRegistry.registerTool({
    name: 'get_last_tweet_and_replies_from_user',
    plugins: 'twitter',
    description: 'Get recent X/Twitter posts and replies from user',
    schema: getLastTweetsAndRepliesFromUserSchema,
    execute: getLastTweetsAndRepliesFromUser,
  });

  StarknetToolRegistry.registerTool({
    name: 'get_last_tweet_from_user',
    plugins: 'twitter',
    description: 'Get recent X/Twitter posts from user',
    schema: getLastTweetsFromUserSchema,
    execute: getLastTweetsFromUser,
  });

  StarknetToolRegistry.registerTool({
    name: 'get_own_twitter_account_info',
    plugins: 'twitter',
    description: 'Get current account profile data',
    execute: getOwnTwitterAccountInfo,
  });
};
