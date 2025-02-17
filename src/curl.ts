import inquirer from 'inquirer';
import chalk from 'chalk';
import { createSpinner } from 'nanospinner';
import { StarknetAgent } from './lib/agent/starknetAgent';
import { RpcProvider } from 'starknet';
import { config } from 'dotenv';
import { load_json_config } from './lib/agent/jsonConfig';
import yargs, { string } from 'yargs';
import { hideBin } from 'yargs/helpers';
config();

// Utilisation

const fs = require('fs');
const tty = require('tty');

const ttyFd = fs.openSync('/dev/tty', 'r+');

const readline = require('readline');
const ttyRead = fs.createReadStream(null, { fd: ttyFd });
const ttyWrite = fs.createWriteStream(null, { fd: ttyFd });
const rl = readline.createInterface({
  input: ttyRead,
  output: ttyWrite,
});

const load_command = async (): Promise<string> => {
  const argv = await yargs(hideBin(process.argv))
    .option('agent', {
      alias: 'a',
      describe: 'Your config agent file name',
      type: 'string',
      default: 'default.agent.json',
    })
    .strict()
    .parse();

  return argv['agent'];
};

const validateEnvVars = () => {
  const required = [
    'STARKNET_RPC_URL',
    'STARKNET_PRIVATE_KEY',
    'STARKNET_PUBLIC_ADDRESS',
    'AI_MODEL',
    'AI_PROVIDER_API_KEY',
  ];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing environment variables:\n${missing.join('\n')}`);
  }
};

const LocalRun = async () => {
  const agent_config_name = await load_command();

  try {
    validateEnvVars();
    const agent_config = load_json_config(agent_config_name);
    const askMode = () => {
      return new Promise((resolve) => {
        rl.question(
          `What mode you want(agent,auto): `,
          (agent_mode: string) => {
            resolve(agent_mode);
          }
        );
      });
    };

    const mode = await askMode();
    console.log(mode);

    if (!mode) {
      console.log('Error');
      return;
    }
    if (mode === 'agent') {
      console.log('hELLO');
        try {
          const agent = new StarknetAgent({
            provider: new RpcProvider({
              nodeUrl: process.env.STARKNET_RPC_URL,
            }),
            accountPrivateKey: process.env.STARKNET_PRIVATE_KEY,
            accountPublicKey: process.env.STARKNET_PUBLIC_ADDRESS,
            aiModel: process.env.AI_MODEL,
            aiProvider: 'anthropic',
            aiProviderApiKey: process.env.AI_PROVIDER_API_KEY,
            signature: 'key',
            agentMode: 'agent',
            agentconfig: agent_config,
          });
          agent.initializeTwitterManager();
          const askMode = () => {
            return new Promise((resolve) => {
              rl.question(
                `User`,
                (prompt: string) => {
                  resolve(prompt);
                }
              );
            });
          };
          const prompt = await askMode();
          const response = await agent.execute(prompt as string);
          console.log(response);
          rl.close();
        } catch (error) {}
    } else if (mode === 'auto') {
      const agent = new StarknetAgent({
        provider: new RpcProvider({ nodeUrl: process.env.STARKNET_RPC_URL }),
        accountPrivateKey: process.env.STARKNET_PRIVATE_KEY,
        accountPublicKey: process.env.STARKNET_PUBLIC_ADDRESS,
        aiModel: process.env.AI_MODEL,
        aiProvider: 'anthropic',
        aiProviderApiKey: process.env.AI_PROVIDER_API_KEY,
        signature: 'key',
        agentMode: 'auto',
        agentconfig: agent_config,
      });

      try {
        await agent.execute_autonomous();
      } catch (error) {
        console.log(error);
      }
    }
  } catch (error) {}
};

LocalRun().catch((error) => {
  console.error();
  process.exit(1);
});
