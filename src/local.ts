import inquirer from 'inquirer';
import chalk from 'chalk';
import { createSpinner } from 'nanospinner';
import { StarknetAgent } from './lib/agent/starknetAgent';
import { RpcProvider } from 'starknet';
import { config } from 'dotenv';

config();

const logo = `

███████╗       █████╗       ██╗  ██╗
██╔════╝      ██╔══██╗      ██║ ██╔╝
███████╗█████╗███████║█████╗█████╔╝ 
╚════██║╚════╝██╔══██║╚════╝██╔═██╗ 
███████║      ██║  ██║      ██║  ██╗
╚══════╝      ╚═╝  ╚═╝      ╚═╝  ╚═╝
`;

const LocalRun = async () => {
  console.log(chalk.magenta(logo));
  console.log(chalk.yellow('Welcome to Starknet-Agent-Kit!\n'));

  const { mode } = await inquirer.prompt([
    {
      type: 'list',
      name: 'mode',
      message: 'Choose your Agent mode:',
      choices: [
        {
          name: chalk.green('Local Agent Kit'),
          value: 'agent',
        },
        {
          name: chalk.blue('Autonomous Agent'),
          value: 'auto',
        },
      ],
    },
  ]);

  const spinner = createSpinner('Initializing Starknet Agent...').start();

  try {
    spinner.success({ text: 'Agent initialized successfully!' });

    if (mode === 'agent') {
      while (true) {
        const { input } = await inquirer.prompt([
          {
            type: 'input',
            name: 'input',
            message: chalk.green('Agent: How can I help you? :'),
            validate: (value: string) => {
              if (!value.trim()) {
                return 'Please enter a valid input';
              }
              return true;
            },
          },
        ]);

        const executionSpinner = createSpinner('').start();

        try {
          const agent = new StarknetAgent({
            provider: new RpcProvider({ nodeUrl: process.env.RPC_URL }),
            accountPrivateKey: process.env.PRIVATE_KEY,
            accountPublicKey: process.env.PUBLIC_ADDRESS,
            aiModel: process.env.AI_MODEL,
            aiProvider: 'anthropic',
            aiProviderApiKey: process.env.AI_PROVIDER_API_KEY,
            signature: 'key',
            agentmode: 'agent',
          });
          const airesponse = await agent.execute(input);
          executionSpinner.success({ text: 'Request completed!' });
          console.log(chalk.cyan('\nResponse:'));
          console.log(chalk.white(airesponse));
        } catch (error) {
          executionSpinner.error({ text: 'Error processing request' });
          console.error(chalk.red('Error:'), error.message);
        }

        const { continue: shouldContinue } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'continue',
            message: 'Would you like to make another request?',
            default: true,
          },
        ]);

        if (!shouldContinue) break;
      }
    } else if (mode === 'auto') {
      const agent = new StarknetAgent({
        provider: new RpcProvider({ nodeUrl: process.env.RPC_URL }),
        accountPrivateKey: process.env.PRIVATE_KEY,
        accountPublicKey: process.env.PUBLIC_ADDRESS,
        aiModel: process.env.AI_MODEL,
        aiProvider: 'anthropic',
        aiProviderApiKey: process.env.AI_PROVIDER_API_KEY,
        signature: 'key',
        agentmode: 'auto',
      });
      const autoSpinner = createSpinner('Running autonomous mode...').start();
      try {
        await agent.execute_autonomous();
        autoSpinner.success({ text: 'Autonomous execution completed!' });
      } catch (error) {
        autoSpinner.error({ text: 'Error in autonomous mode' });
        console.error(chalk.red('Error:'), error.message);
      }
    }
  } catch (error) {
    spinner.error({ text: 'Failed to initialize agent' });
    console.error(chalk.red('Error:'), error.message);
  }
};

LocalRun().catch((error) => {
  console.error(chalk.red('\nFatal Error:'), error.message);
  process.exit(1);
});
