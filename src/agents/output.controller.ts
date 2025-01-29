import { Body, Controller, OnModuleInit, Post } from '@nestjs/common';
import { StarknetAgent } from '../lib/agent/starknetAgent';
import { ConfigurationService } from '../config/configuration';
import { WalletService } from './services/wallet.service';
import { AgentRequestDTO } from './dto/agents';
import { AgentService } from './services/agent.service';

@Controller('output')
export class OutputController implements OnModuleInit {
  private agent: StarknetAgent;

  constructor(
    private readonly agentService: AgentService,
    private readonly config: ConfigurationService
  ) {}

  onModuleInit() {
    this.agent = new StarknetAgent({
      provider: this.config.starknet.provider,
      accountPrivateKey: this.config.starknet.privateKey,
      accountPublicKey: this.config.starknet.publicKey,
      aiModel: this.config.ai.model,
      aiProvider: this.config.ai.provider,
      aiProviderApiKey: this.config.ai.apiKey,
      signature: 'output',
    });
  }

  @Post('request')
  async handleUserRequest(@Body() userRequest: AgentRequestDTO) {
    return await this.agentService.handleUserRequest(
      this.agent,
      userRequest
    );
  }
}