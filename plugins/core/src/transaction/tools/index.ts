import {
  StarknetAgentInterface,
  StarknetToolRegistry,
} from '@starknet-agent-kit/agent';
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

export const registerTransactionTools = (agent: StarknetAgentInterface) => {
  // Simulate transactions
  StarknetToolRegistry.registerTool({
    name: 'simulate_transaction',
    plugins: 'transaction',
    description: 'Simulate a transaction without executing it',
    schema: simulateInvokeTransactionSchema,
    execute: simulateInvokeTransaction,
  });
  StarknetToolRegistry.registerTool({
    name: 'simulate_deploy_transaction',
    plugins: 'transaction',
    description: 'Simulate Deploy transaction',
    schema: simulateDeployTransactionSchema,
    execute: simulateDeployTransaction,
  });

  StarknetToolRegistry.registerTool({
    name: 'simulate_declare_transaction',
    plugins: 'transaction',
    description: 'Simulate Declare transaction',
    schema: simulateDeclareTransactionSchema,
    execute: simulateDeclareTransaction,
  });

  StarknetToolRegistry.registerTool({
    name: 'simulate_deploy_account_transaction',
    plugins: 'transaction',
    description: 'Simulate Deploy Account transaction',
    schema: simulateDeployAccountTransactionSchema,
    execute: simulateDeployAccountTransaction,
  });
};
