import { StarknetAgentInterface } from '../../tools/tools';
import { TwitterApi } from 'twitter-api-v2';
import { config } from 'dotenv';

config();

export const createXpost = async (
  agent: StarknetAgentInterface,
  post: string | { post: string }
) => {
  try {
    const userClient = new TwitterApi({
      appKey: process.env.TWITTER_API as string,
      appSecret: process.env.TWITTER_API_SECRET as string,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    });

    if (!userClient) {
      throw new Error('TwitterApi failed check your env');
    }

    const postText = typeof post === 'string' ? post : post.post;

    console.log('Post content:', postText);

    const test = await userClient.v2.tweet({ text: postText });
    return {
      status: 'success',
    };
  } catch (error) {
    console.log(error);
    return {
      status: 'failed',
    };
  }
};
