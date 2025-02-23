import { IsNotEmpty } from 'class-validator';
import { StarknetAgentInterface } from '../../../server/agent/tools/tools';

export class CreateAgentDTO {
  @IsNotEmpty()
  accountagent: StarknetAgentInterface;
  @IsNotEmpty()
  anthropicApiKey: string;
  @IsNotEmpty()
  agentName: string;
}
