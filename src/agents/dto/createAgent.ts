import { IsNotEmpty } from 'class-validator';

export class CreateAgentDTO {
  @IsNotEmpty()
  walletPrivateKey: string;
  @IsNotEmpty()
  anthropicApiKey: string;
  @IsNotEmpty()
  agentName: string;
}
