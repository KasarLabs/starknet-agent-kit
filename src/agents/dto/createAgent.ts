import { IsNotEmpty } from 'class-validator';
import { StarknetAgentInterface } from 'src/lib/agent/tools';

export class CreateAgentDTO {
  @IsNotEmpty()
  accountagent: StarknetAgentInterface;
  @IsNotEmpty()
  anthropicApiKey: string;
  @IsNotEmpty()
  agentName: string;
}
