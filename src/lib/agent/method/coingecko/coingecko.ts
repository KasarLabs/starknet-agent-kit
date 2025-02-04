import { CoinGeckoCheckTokenPriceParams } from '../../schema/schema';
import { StarknetAgentInterface } from '../../tools/tools';

export const CoinGeckoCheckApiServerStatus = async () => {
  try {
    console.log('CoinGeckoCheckApiServerStatus');
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'x-cg-demo-api-key': `${process.env.CG_API_KEY}`,
      },
    };
    const response = await fetch(
      `https://api.coingecko.com/api/v3/ping`,
      options
    );
    console.log('Response : ', response);
    return {
      status: 'success',
    };
  } catch (error) {
    return {
      status: 'failure',
    };
  }
};

export type CoinGeckoToken = {
  name: string;
};

// Maybe add the possiblity to add currency and all the params of this query on gecko see : https://docs.coingecko.com/reference/simple-price
export const CoinGeckoCheckTokenPrice = async (
  agent: StarknetAgentInterface,
  tokens: CoinGeckoCheckTokenPriceParams
) => {
  try {
    console.log('CoinGeckoCheckTokenPrice');

    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'x-cg-demo-api-key': `${process.env.CG_API_KEY}`,
      },
    };

    if (!Array.isArray(tokens.tokens)) {
      throw new Error('CoinGeckoCheckTokenPrice params name is not an Array');
    }

    let basic_url = `https://api.coingecko.com/api/v3/simple/price?ids=`;
    tokens.tokens.map((name, index) => {
      if (index != 0) {
        basic_url = basic_url + `%2C`;
      }
      basic_url = basic_url + name.name;
    });
    basic_url = basic_url + `&vs_currencies=usd`;
    const response = await fetch(basic_url, options);
    const result = await response.json();
    console.log('Result :', result);
    return {
      status: 'success',
      result: result,
    };
  } catch (error) {
    console.log(error);
    return {
      status: 'failure',
    };
  }
};

export const CoinGeckoCheckApiListSupportedTokens = async () => {
  try {
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'x-cg-demo-api-key': `${process.env.CG_API_KEY}`,
      },
    };

    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/supported_vs_currencies',
      options
    );

    const result = await response.json();
    console.log(result);
    return {
      status: 'sucess',
      supported_tokens: result,
    };
  } catch (error) {
    console.log(error);
    return {
      status: 'failure',
    };
  }
};

export const CoinGeckoTrendingSearchList = async () => {
  try {
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'x-cg-demo-api-key': `${process.env.CG_API_KEY}`,
      },
    };

    const response = await fetch(
      'https://api.coingecko.com/api/v3/search/trending',
      options
    );

    const result = await response.json();
    console.log(result);
    return {
      status: 'sucess',
      supported_tokens: result,
    };
  } catch (error) {
    console.log(error);
    return {
      status: 'failure',
    };
  }
};
