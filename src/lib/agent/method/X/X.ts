import { StarknetAgentInterface } from '../../tools/tools';
import { TwitterApi } from 'twitter-api-v2';
import { Scraper } from 'agent-twitter-client';

export const createXpost = async (
  agent: StarknetAgentInterface,
  post: string | { post: string }
) => {
  try {
    const postText = typeof post === 'string' ? post : post.post;
    if (
      process.env.TWITTER_USERNAME &&
      process.env.TWITTER_PASSWORD &&
      process.env.TWITTER_EMAIL
    ) {
      const scraper = new Scraper();
      await scraper.login(
        process.env.TWITTER_USERNAME as string,
        process.env.TWITTER_PASSWORD as string,
        process.env.TWITTER_EMAIL as string
      );
      await scraper.sendTweet(postText);
      return {
        status: 'success',
      };
    }
    if (
      process.env.TWITTER_API &&
      process.env.TWITTER_API_SECRET &&
      process.env.TWITTER_ACCESS_TOKEN &&
      process.env.TWITTER_ACCESS_TOKEN_SECRET
    ) {
      const userClient = new TwitterApi({
        appKey: process.env.TWITTER_API as string,
        appSecret: process.env.TWITTER_API_SECRET as string,
        accessToken: process.env.TWITTER_ACCESS_TOKEN,
        accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
      });

      if (!userClient) {
        throw new Error('TwitterApi failed check your env');
      }

      console.log('Post content:', postText);

      const test = await userClient.v2.tweet({ text: postText });
      return {
        status: 'success',
      };
    } else {
      throw new Error(`You don't set Twitter API or Twitter Account`);
    }
  } catch (error) {
    console.log(error);
    return {
      status: 'failed',
    };
  }
};
