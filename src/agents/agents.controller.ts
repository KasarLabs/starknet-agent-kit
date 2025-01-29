import { AgentRequestDTO } from './dto/agents';
import { StarknetAgent } from '../lib/agent/starknetAgent';
import { AgentService } from './services/agent.service';
import { ConfigurationService } from '../config/configuration';
import { AgentResponseInterceptor } from 'src/lib/interceptors/response';
import { Body, Controller, Get, OnModuleInit, Param, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { FileTypeGuard } from './guard/file-validator.guard';

@Controller('agent')
@UseInterceptors(AgentResponseInterceptor)
export class AgentsController implements OnModuleInit {
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
    });
  }

  @Post('request')
  async handleUserRequest(@Body() userRequest: AgentRequestDTO) {
    return await this.agentService.handleUserRequest(this.agent, userRequest);
  }

  @Post('upload')
  @UseGuards(new FileTypeGuard(['application/json','application/zip']))
  async uploadFile(@Req() req: FastifyRequest) {
    return ("Tudo bem")
  }

  @Get('status')
  async getAgentStatus() {
    return await this.agentService.getAgentStatus(this.agent);
  }
}
