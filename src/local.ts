import inquirer from 'inquirer';
import chalk from 'chalk';
import { createSpinner } from 'nanospinner';
import { StarknetAgent } from './lib/agent/starknetAgent';
import { RpcProvider } from 'starknet';
import { config } from 'dotenv';
import { load_json_config } from './lib/agent/jsonConfig';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import * as fs from 'fs';
import path from 'path';

config();

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

const clearScreen = () => {
  process.stdout.write('\x1Bc');
};

const logo = `${chalk.cyan(`
  ____  _             _               _        _                    _     _  ___ _   
 / ___|| |_ __ _ _ __| | ___ __   ___| |_     / \\   __ _  ___ _ __ | |_  | |/ (_) |_ 
 \\___ \\| __/ _\` | '__| |/ / '_ \\ / _ \\ __|   / _ \\ / _\` |/ _ \\ '_ \\| __| | ' /| | __|
  ___) | || (_| | |  |   <| | | |  __/ |_   / ___ \\ (_| |  __/ | | | |_  | . \\| | |_ 
 |____/ \\__\\__,_|_|  |_|\\_\\_| |_|\\___|\\__| /_/   \\_\\__, |\\___|_| |_|\\__| |_|\\_\\_|\\__|
                                                   |___/                             
`)}`;

const createBox = (
  content: unknown,
  options: { title?: string; isError?: boolean } = {}
) => {
  const { title = '', isError = false } = options;
  const contentStr = String(content);
  const color = isError ? chalk.red : chalk.cyan;
  const width = process.stdout.columns > 100 ? 100 : process.stdout.columns - 4;
  const topBorder = '╭' + '─'.repeat(width - 2) + '╮';
  const bottomBorder = '╰' + '─'.repeat(width - 2) + '╯';

  let result = '\n';
  if (title) {
    result += `${color('┌' + '─'.repeat(title.length + 2) + '┐')}\n`;
    result += `${color('│')} ${title} ${color('│')}\n`;
  }
  result += color(topBorder) + '\n';
  result +=
    color('│') +
    ' ' +
    contentStr +
    ' '.repeat(Math.max(0, width - contentStr.length - 3)) +
    '\n';
  result += color(bottomBorder) + '\n';
  return result;
};

function reloadEnvVars() {
  Object.keys(process.env).forEach((key) => {
    delete process.env[key];
  });

  const result = config({
    path: path.resolve(process.cwd(), '.env'),
    override: true,
  });

  if (result.error) {
    throw new Error('Failed to reload .env file');
  }

  return result.parsed;
}

const validateEnvVars = async () => {
  const required = [
    'STARKNET_RPC_URL',
    'STARKNET_PRIVATE_KEY',
    'STARKNET_PUBLIC_ADDRESS',
    'AI_MODEL',
    'AI_PROVIDER_API_KEY',
  ];
  const missings = required.filter((key) => !process.env[key]);
  if (missings.length > 0) {
    console.error(`Missing environment variables:\n${missings.join('\n')}`);
    for (const missing of missings) {
      const { prompt } = await inquirer.prompt([
        {
          type: 'input',
          name: 'prompt',
          message: chalk.redBright(`Enter the value of ${missing}:`),
          validate: (value: string) => {
            const trimmed = value.trim();
            if (!trimmed) return 'Please enter a valid message';
            return true;
          },
        },
      ]);
      await new Promise((resolve, reject) => {
        fs.appendFile('.env', `\n${missing}=${prompt}\n`, (err) => {
          if (err) reject(new Error('Error when trying to write on .env file'));
          resolve(null);
        });
      });
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    reloadEnvVars();
    await validateEnvVars();
  }
};

const LocalRun = async () => {
  clearScreen();
  console.log(logo);
  console.log(createBox('Welcome to Starknet-Agent-Kit'));
  const agent_config_name = await load_command();
  const { mode } = await inquirer.prompt([
    {
      type: 'list',
      name: 'mode',
      message: 'Select operation mode:',
      choices: [
        {
          name: `${chalk.green('>')} Interactive Mode`,
          value: 'agent',
          short: 'Interactive',
        },
        {
          name: `${chalk.blue('>')} Autonomous Mode`,
          value: 'auto',
          short: 'Autonomous',
        },
      ],
    },
  ]);

  clearScreen();
  console.log(logo);
  const spinner = createSpinner('Initializing Starknet Agent').start();

  try {
    spinner.stop();
    await validateEnvVars();
    spinner.success({ text: 'Agent initialized successfully' });
    const agent_config = load_json_config(agent_config_name);
    if (mode === 'agent') {
      console.log(chalk.dim('\nStarting interactive session...\n'));

      while (true) {
        const { user } = await inquirer.prompt([
          {
            type: 'input',
            name: 'user',
            message: chalk.green('User'),
            validate: (value: string) => {
              const trimmed = value.trim();
              if (!trimmed) return 'Please enter a valid message';
              return true;
            },
          },
        ]);

        const executionSpinner = createSpinner('Processing request').start();

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
          const airesponse = await agent.execute(user);
          executionSpinner.success({ text: 'Response received' });

          console.log(createBox(airesponse, { title: 'Agent' }));
        } catch (error) {
          executionSpinner.error({ text: 'Error processing request' });
          console.error(createBox(error.message, { isError: true }));
        }
      }
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

      agent.initializeTwitterManager();
      console.log(chalk.dim('\nStarting autonomous session...\n'));
      const autoSpinner = createSpinner('Running autonomous mode').start();

      try {
        await agent.execute_autonomous();
        autoSpinner.success({ text: 'Autonomous execution completed' });
      } catch (error) {
        autoSpinner.error({ text: 'Error in autonomous mode' });
        console.error(createBox(error.message, { isError: true }));
      }
    }
  } catch (error) {
    spinner.error({ text: 'Failed to initialize agent' });
    console.error(createBox(error.message, { isError: true }));
  }
};

LocalRun().catch((error) => {
  console.error(
    createBox(error.message, { isError: true, title: 'Fatal Error' })
  );
  process.exit(1);
});
