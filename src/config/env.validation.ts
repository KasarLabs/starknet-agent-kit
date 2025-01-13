import { z } from 'zod';

export const envSchema = z.object({
  // Server configuration
  PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default('3000'),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  API_KEY: z.string().min(1, 'API key is missing'),

  // Starknet configuration
  STARKNET_PRIVATE_KEY: z.string().min(1, 'Starknet private key is required'),
  PUBLIC_ADDRESS: z.string().min(1, 'Public address is required'),
  RPC_URL: z.string().url('Invalid RPC URL'),

  // Service configuration
  ANTHROPIC_API_KEY: z.string().min(1, 'Anthropic API key is required'),
});

export type EnvConfig = z.infer<typeof envSchema>;
