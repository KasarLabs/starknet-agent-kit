import { StarknetTool } from '@starknet-agent-kit/agents';
import {
  simulateInvokeTransactionSchema,
  simulateDeployAccountTransactionSchema,
  simulateDeployTransactionSchema,
  simulateDeclareTransactionSchema,
} from '../schema';
import {
  simulateDeployAccountTransaction,
  simulateInvokeTransaction,
  simulateDeployTransaction,
  simulateDeclareTransaction,
} from '../actions/simulateTransaction';

export const registerTools = (tool: StarknetTool[]) => {
  // Simulate transactions
  tool.push({
    name: 'simulate_transaction',
    plugins: 'transaction',
    description: 'Simulate a transaction without executing it',
    schema: simulateInvokeTransactionSchema,
    execute: simulateInvokeTransaction,
  });
  tool.push({
    name: 'simulate_deploy_transaction',
    plugins: 'transaction',
    description: 'Simulate Deploy transaction',
    schema: simulateDeployTransactionSchema,
    execute: simulateDeployTransaction,
  });

  tool.push({
    name: 'simulate_declare_transaction',
    plugins: 'transaction',
    description: 'Simulate Declare transaction',
    schema: simulateDeclareTransactionSchema,
    execute: simulateDeclareTransaction,
  });

  tool.push({
    name: 'simulate_deploy_account_transaction',
    plugins: 'transaction',
    description: 'Simulate Deploy Account transaction',
    schema: simulateDeployAccountTransactionSchema,
    execute: simulateDeployAccountTransaction,
  });
};
