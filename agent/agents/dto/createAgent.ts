import { IsNotEmpty } from 'class-validator';
import { StarknetAgentInterface } from 'agent/lib/agent/tools/tools';

export class CreateAgentDTO {
  @IsNotEmpty()
  accountagent: StarknetAgentInterface;
  @IsNotEmpty()
  anthropicApiKey: string;
  @IsNotEmpty()
  agentName: string;
}
