import { Body, Controller, OnModuleInit, Post } from '@nestjs/common';
import { StarknetAgent } from '../lib/agent/starknetAgent';
import { ConfigurationService } from '../config/configuration';
import { WalletService } from './services/wallet.service';
import { AgentRequestDTO } from './dto/agents';

@Controller('wallet')
export class WalletController implements OnModuleInit {
  private agent: StarknetAgent;

  constructor(
    private readonly walletService: WalletService,
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
      signature: 'wallet',
      agentMode: 'agent',
      agentMemory: false,
    });
  }

  @Post('request')
  async handleUserCalldataRequest(@Body() userRequest: AgentRequestDTO) {
    return await this.walletService.handleUserCalldataRequest(
      this.agent,
      userRequest
    );
  }

  @Post('output')
  async HandleOutputIAParsing(@Body() userRequest: AgentRequestDTO) {
    return await this.walletService.HandleOutputIAParsing(userRequest);
  }
}
