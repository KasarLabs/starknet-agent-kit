import { AgentRequestDTO } from './dto/agents';
import { StarknetAgent } from '../lib/agent/starknetAgent';
import { AgentService } from './services/agent.service';
import { ConfigurationService } from '../config/configuration';
import { AgentResponseInterceptor } from 'src/lib/interceptors/response';
import { Body, Controller, Get, OnModuleInit, Param, Post, Req, UploadedFile, UseGuards, UseInterceptors, Logger } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { FileTypeGuard } from './guard/file-validator.guard';
import { promises as fs } from 'fs';

interface filename {
  filename: string;
}

@Controller('key')
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
      signature: 'key',
    });
  }

  @Post('request')
  async handleUserRequest(@Body() userRequest: AgentRequestDTO) {
    return await this.agentService.handleUserRequest(this.agent, userRequest);
  }

  @Post('upload')
  @UseGuards(new FileTypeGuard(['application/json','application/zip']))
  async uploadFile(@Req() req: FastifyRequest) {
    const logger = new Logger("Upload service");
    logger.debug({message: "The file has been uploaded"});
    return ({status: "success", data: "The file has been uploaded."});
  }

  
  @Post('delete')
  async deleteUploadFile(@Body() filename: filename){
    const logger = new Logger("Upload service");
    const filePath = `./uploads/${filename.filename}`;

    try {
      await fs.unlink(filePath);
      logger.debug({message: `File ${filename.filename} has been deleted`});
      return ({status: "success", data: "The file has been deleted."});
    } catch(error) {
      logger.error('Error delete file', {
        error: {
          message: error.message,
          name: error.name,
          stack: error.stack,
        },
        filePath: filePath
      });
      switch (error.code) {
        case 'ENOENT':
          throw new Error(`File not found : ${filePath}`); // Ou HttpException(404)
        case 'EACCES':
          throw new Error(`Insufficient permits for ${filePath}`); // HttpException(403)
        default:
          throw new Error(`Deletion error : ${error.message}`); // throw personalised error
    }
  }

  }

  @Get('status')
  async getAgentStatus() {
    return await this.agentService.getAgentStatus(this.agent);
  }
}
