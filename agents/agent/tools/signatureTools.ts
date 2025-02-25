import { tool } from '@langchain/core/tools';
// import { registerSignatureToolsAccount } from '@plugins/core/account/tools/tools_signature';
// import { registerSignatureToolsToken } from '@plugins/core/token/tools/tools_signature';
// import { registerSignatureArtpeaceTools } from '@plugins/artpeace/tools/signatureTools';
export interface SignatureTool<P = any> {
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

  static async createSignatureTools(allowed_signature_tools: string[]) {
    await RegisterSignatureTools(allowed_signature_tools, this.tools);
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

export const RegisterSignatureTools = async (
  allowed_signature_tools: string[],
  tools: SignatureTool[]
) => {
  try {
    await Promise.all(
      allowed_signature_tools.map(async (tool) => {
        let imported_tool;
        imported_tool = await import(`@starknet-agent-kit/${tool}`);
        if (typeof imported_tool.registerSignatureTools !== 'function') {
          console.error(`Tool does not have a registerSignatureTools function ${tool}`);
          return false;
        }
        console.log(`Registering Signature tools ${tool}`);
        imported_tool.registerSignatureTools(tools);
        return true;
      })
    );
  } catch (error) {
    console.log(error);
  }
};

export const createSignatureTools = async (
  allowed_signature_tools: string[]
) => {
  return StarknetSignatureToolRegistry.createSignatureTools(
    allowed_signature_tools
  );
};

export default StarknetSignatureToolRegistry;
