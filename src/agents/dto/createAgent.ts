import { IsNotEmpty } from 'class-validator';

export class CreateAgentDTO {
  @IsNotEmpty()
  accountPrivateKey: string;
  @IsNotEmpty()
  anthropicApiKey: string;
  @IsNotEmpty()
  agentName: string;
}
