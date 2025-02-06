export interface Token {
  symbol: string;
  amount: string;
}

export interface Limit {
  transfer_limit?: Token[];
}

export const AddAgentLimit = (): Limit => {
  try {
    let limit_token: Limit = {} as Limit;
    const json = require('../../../config/limit/config-limit.json');
    if (!json) {
      throw new Error(`Can't access to ./config/limit/config-limit.jspon`);
    }
    if (json.transfer_limit) {
      limit_token.transfer_limit = json.transfer_limit;
    }
    if (!limit_token.transfer_limit) {
      throw new Error(
        `You dont't define limit transfer token is at your risk`
      );
    }
    return limit_token;
  } catch (error) {
    console.log(error);
    const limit: Limit = {};
    return limit;
  }
};
