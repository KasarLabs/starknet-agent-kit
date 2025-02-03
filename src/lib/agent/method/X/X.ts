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
        appKey: '',
        appSecret: '',
        accessToken: '',
        accessSecret: '',
      });
  
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