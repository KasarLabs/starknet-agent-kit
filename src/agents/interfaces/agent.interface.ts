export interface IAgent {
  execute(input: string): Promise<unknown>;
  getCredentials(): {
    walletPrivateKey: string;
    aiProviderApiKey: string;
    aiModel: string;
  };
}
