import {
  getLastTweetsAndRepliesFromUserParams,
  getLastTweetsFromUserParams,
  getLastTweetsOptionsParams,
  getLastUserXTweetParams,
  getTwitterProfileFromUsernameParams,
  getTwitterUserIdFromUsernameParams,
} from '../schema/index';
import { StarknetAgentInterface } from '../../../tools/tools';
import { TweetType } from '../types/twitter_types';

export const getLastUserTweet = async (
  agent: StarknetAgentInterface,
  params: getLastUserXTweetParams
) => {
  try {
    console.log('GetLastUserTweet');
    if (agent.getTwitterAuthMode() != 'CREDIDENTIALS') {
      throw new Error('You need to be in CREDIDENTIALS twitter_auth_mode');
    }
    const twitter_client =
      agent.getTwitterManager().twitter_scraper?.twitter_client;
    if (!twitter_client) {
      throw new Error('twitter_client is undefined');
    }

    const lastestTweet = await twitter_client.getLatestTweet(
      params.account_name
    );
    if (!lastestTweet) {
      throw new Error('Error trying to get the latest tweet');
    }
    return {
      status: 'success',
      post_id: lastestTweet.id,
      post_text: lastestTweet.text,
    };
  } catch (error) {
    console.log(error);
    return {
      status: 'failure',
      error: error,
    };
  }
};

export const getLastTweetsOptions = async (
  agent: StarknetAgentInterface,
  params: getLastTweetsOptionsParams
) => {
  try {
    console.log('GetLastTweetsOptions');
    if (agent.getTwitterAuthMode() != 'CREDIDENTIALS') {
      throw new Error('You need to be in CREDIDENTIALS twitter_auth_mode');
    }
    const twitter_client =
      agent.getTwitterManager().twitter_scraper?.twitter_client;
    const collectedTweets: TweetType[] = [];

    if (!twitter_client) {
      throw new Error('twitter_client is undefined');
    }
    const tweets = twitter_client.searchTweets(params.query, params.maxTeets);
    for await (const tweet of tweets) {
      const tweet_type: TweetType = {
        id: tweet.id as string,
        content: tweet.text as string,
      };
      console.log(tweet.id);
      console.log(tweet.text);
      collectedTweets.push(tweet_type);
    }
    console.log(collectedTweets);
    return {
      status: 'success',
      result: collectedTweets,
    };
  } catch (error) {
    console.log(error);
    return {
      status: 'failure',
      error: error,
    };
  }
};

export const getOwnTwitterAccountInfo = async (
  agent: StarknetAgentInterface
) => {
  try {
    console.log('getOwnTwitterAccountInfo');
    if (agent.getTwitterAuthMode() != 'CREDIDENTIALS') {
      throw new Error('You need to be in CREDIDENTIALS twitter_auth_mode');
    }
    const twitter_client =
      agent.getTwitterManager().twitter_scraper?.twitter_client;
    if (!twitter_client) {
      throw new Error('twitter_client is undefined');
    }

    const my_twitter_account = await twitter_client.me();
    console.log(my_twitter_account);
    return {
      status: 'success',
      my_account_username: my_twitter_account,
    };
  } catch (error) {
    console.log(error);
    return {
      status: 'failure',
      error: error,
    };
  }
};

export const getLastTweetsFromUser = async (
  agent: StarknetAgentInterface,
  params: getLastTweetsFromUserParams
) => {
  console.log('getLastTweetsFromUser');
  try {
    if (agent.getTwitterAuthMode() != 'CREDIDENTIALS') {
      throw new Error('You need to be in CREDIDENTIALS twitter_auth_mode');
    }
    const twitter_client =
      agent.getTwitterManager().twitter_scraper?.twitter_client;
    if (!twitter_client) {
      throw new Error('twitter_client is undefined');
    }
    const tweets = params.maxTweets
      ? twitter_client.getTweets(params.username, params.maxTweets)
      : twitter_client.getTweets(params.username);
    const collectedTweets: TweetType[] = [];
    for await (const tweet of tweets) {
      const tweet_type: TweetType = {
        id: tweet.id as string,
        content: tweet.text as string,
      };
      collectedTweets.push(tweet_type);
    }

    return {
      status: 'success',
      tweets: collectedTweets,
    };
  } catch (error) {
    console.log(error);
    return {
      status: 'failure',
      error: error,
    };
  }
};

export const getLastTweetsAndRepliesFromUser = async (
  agent: StarknetAgentInterface,
  params: getLastTweetsAndRepliesFromUserParams
) => {
  try {
    console.log('getLastTweetsAndRepliesFromUser');
    if (agent.getTwitterAuthMode() != 'CREDIDENTIALS') {
      throw new Error('You need to be in CREDIDENTIALS twitter_auth_mode');
    }
    const twitter_client =
      agent.getTwitterManager().twitter_scraper?.twitter_client;
    if (!twitter_client) {
      throw new Error('twitter_client is undefined');
    }
    const tweets = params.maxTweets
      ? twitter_client.getTweetsAndReplies(params.username, params.maxTweets)
      : twitter_client.getTweetsAndReplies(params.username);

    const collectedTweets: TweetType[] = [];
    for await (const tweet of tweets) {
      const tweet_type: TweetType = {
        id: tweet.id as string,
        content: tweet.text as string,
      };
      collectedTweets.push(tweet_type);
    }

    return {
      status: 'success',
      tweets: collectedTweets,
    };
  } catch (error) {
    console.log(error);
    return {
      status: 'failure',
      error: error,
    };
  }
};

export const getTwitterUserIdFromUsername = async (
  agent: StarknetAgentInterface,
  params: getTwitterUserIdFromUsernameParams
) => {
  try {
    console.log('getTwitterUserIdFromUsername');
    if (agent.getTwitterAuthMode() != 'CREDIDENTIALS') {
      throw new Error('You need to be in CREDIDENTIALS twitter_auth_mode');
    }
    const twitter_client =
      agent.getTwitterManager().twitter_scraper?.twitter_client;
    if (!twitter_client) {
      throw new Error('twitter_client is undefined');
    }
    const userId = await twitter_client.getUserIdByScreenName(params.username);
    return {
      status: 'success',
      user_id: userId,
    };
  } catch (error) {
    console.log(error);
    return {
      status: 'failure',
      error: error,
    };
  }
};

export const getTwitterProfileFromUsername = async (
  agent: StarknetAgentInterface,
  params: getTwitterProfileFromUsernameParams
) => {
  try {
    console.log('geTwitterUserIdFromUsername');
    if (agent.getTwitterAuthMode() != 'CREDIDENTIALS') {
      throw new Error('You need to be in CREDIDENTIALS twitter_auth_mode');
    }
    const twitter_client =
      agent.getTwitterManager().twitter_scraper?.twitter_client;
    if (!twitter_client) {
      throw new Error('twitter_client is undefined');
    }
    const userId = await twitter_client.getProfile(params.username);
    if (!userId) {
      throw new Error(`Account don't exist`);
    }
    return {
      status: 'success',
      user_id: userId,
    };
  } catch (error) {
    console.log(error);
    return {
      status: 'failure',
      error: error,
    };
  }
};
