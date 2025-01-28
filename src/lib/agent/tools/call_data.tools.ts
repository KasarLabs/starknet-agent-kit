import { tool } from '@langchain/core/tools';
import { transfer_call_data_schema } from '../schema/schma_call_data';
import { transfer_call_data } from '../method/token/transfer';

interface CalldataTool<P = any> {
  name: string;
  description: string;
  schema?: object;
  execute: (params: P) => Promise<unknown>;
}

export class StarknetCalldataToolRegistry {
  private static tools: CalldataTool[] = [];

  static RegistercalldataTools<P>(tool: CalldataTool<P>): void {
    this.tools.push(tool);
  }

  static createCalldataTools() {
    return this.tools.map(({ name, description, schema, execute }) => {
      const toolInstance = tool(async (params: any) => execute(params), {
        name,
        description,
        ...(schema && { schema }),
      });
      return toolInstance;
    });
  }
}

export const RegistercalldataTools = () => [
  StarknetCalldataToolRegistry.RegistercalldataTools({
    name: 'transfer',
    description: 'return transfer json transaction',
    schema: transfer_call_data_schema,
    execute: transfer_call_data,
  }),
];

RegistercalldataTools();

export const createCalldataTools = () => {
  return StarknetCalldataToolRegistry.createCalldataTools();
};

export default StarknetCalldataToolRegistry;
