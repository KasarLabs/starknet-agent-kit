import { envSchema, type EnvConfig } from './env.validation';

export class ConfigurationService {
  private readonly config: EnvConfig;

  constructor(env: Record<string, unknown>) {
    const result = envSchema.safeParse(env);

    if (!result.success) {
      console.error(
        '❌ Invalid environment variables:',
        JSON.stringify(result.error.format(), null, 2)
      );
      throw new Error('Invalid environment variables');
    }

    this.config = result.data;
  }

  get port(): number {
    return this.config.PORT;
  }

  get nodeEnv(): string {
    return this.config.NODE_ENV;
  }

  get apiKey(): string {
    return this.config.API_KEY;
  }

  get starknet() {
    return {
      privateKey: this.config.PRIVATE_KEY,
      publicAddress: this.config.PUBLIC_ADDRESS,
      rpcUrl: this.config.RPC_URL,
    };
  }

  get anthropic() {
    return {
      apiKey: this.config.ANTHROPIC_API_KEY,
    };
  }

  get isDevelopment(): boolean {
    return this.config.NODE_ENV === 'development';
  }

  get isProduction(): boolean {
    return this.config.NODE_ENV === 'production';
  }

  get isTest(): boolean {
    return this.config.NODE_ENV === 'test';
  }
}
