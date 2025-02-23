import { tool } from '@langchain/core/tools';
import { registerSignatureToolsAccount } from '@starknet-agent-kit/core/account/src/tools/tools_signature';
// import { registerSignatureToolsToken } from '@starknet-agent-kit/core/src/token/tools/tools_signature';

interface SignatureTool<P = any> {
  name: string;
  categorie?: string;
  description: string;
  schema?: object;
  execute: (params: P) => Promise<unknown>;
}

export class StarknetSignatureToolRegistry {
  private static tools: SignatureTool[] = [];

  static RegisterSignatureTools<P>(tool: SignatureTool<P>): void {
    this.tools.push(tool);
  }

  static createSignatureTools() {
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

export const RegisterSignatureTools = () => {
  // registerSignatureToolsToken();
  registerSignatureToolsAccount();
};

RegisterSignatureTools();

export const createSignatureTools = () => {
  return StarknetSignatureToolRegistry.createSignatureTools();
};

export default StarknetSignatureToolRegistry;
