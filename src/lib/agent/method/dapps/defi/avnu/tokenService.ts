import { Token, fetchTokens } from '@avnu/avnu-sdk';

export class TokenService {
  private tokenCache: Map<string, Token> = new Map();
  
  async initializeTokens(): Promise<void> {
    try {
      const response = await fetchTokens();
      response.content.forEach(token => {
        this.tokenCache.set(token.symbol.toLowerCase(), token);
      });
    } catch (error) {
      throw new Error(`Failed to initialize tokens: ${error.message}`);
    }
  }

  getToken(symbol: string): Token | undefined {
    return this.tokenCache.get(symbol.toLowerCase());
  }

  validateTokenPair(sellSymbol: string, buySymbol: string): { 
    sellToken: Token; 
    buyToken: Token 
  } {
    const sellToken = this.getToken(sellSymbol);
    const buyToken = this.getToken(buySymbol);

    if (!sellToken) throw new Error(`Sell token ${sellSymbol} not supported`);
    if (!buyToken) throw new Error(`Buy token ${buySymbol} not supported`);

    return { sellToken, buyToken };
  }
}
  