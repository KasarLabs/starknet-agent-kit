import {
  Body,
  Controller,
  Get,
  Logger,
  NotFoundException,
  OnModuleInit,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AgentRequestDTO } from './dto/agents';
import { StarknetAgent } from '../lib/agent/starknetAgent';
import { AgentService } from './services/agent.service';
import { ConfigurationService } from '../config/configuration';
import { AgentResponseInterceptor } from 'src/lib/interceptors/response';
import { FileTypeGuard } from 'src/lib/guard/file-validator.guard';
import { FastifyRequest } from 'fastify';
import { promises as fs } from 'fs';

@Controller('key')
@UseInterceptors(AgentResponseInterceptor)
export class AgentsController implements OnModuleInit {
  private agent: StarknetAgent;

  constructor(
    private readonly agentService: AgentService,
    private readonly config: ConfigurationService
  ) {}

  async onModuleInit() {
    const network = await this.config.starknet.network;
    this.agent = new StarknetAgent({
      provider: this.config.starknet.provider,
      network: network,
      accountPrivateKey: this.config.starknet.privateKey,
      accountPublicKey: this.config.starknet.publicKey,
      aiModel: this.config.ai.model,
      aiProvider: this.config.ai.provider,
      aiProviderApiKey: this.config.ai.apiKey,
      signature: 'key',
      agentMode: 'agent',
    });
  }

  @Post('request')
  async handleUserRequest(@Body() userRequest: AgentRequestDTO) {
    return await this.agentService.handleUserRequest(this.agent, userRequest);
  }

  @Get('status')
  async getAgentStatus() {
    return await this.agentService.getAgentStatus(this.agent);
  }

  @Post('upload_large_file')
  @UseGuards(
    new FileTypeGuard([
      'application/json',
      'application/zip',
      'image/jpeg',
      'image/png',
    ])
  )
  async uploadFile(@Req() req: FastifyRequest) {
    const logger = new Logger('Upload service');
    logger.debug({ message: 'The file has been uploaded' });
    return { status: 'success', data: 'The file has been uploaded.' };
  }

  @Post('delete_large_file')
  async deleteUploadFile(@Body() filename: { filename: string }) {
    const logger = new Logger('Upload service');

    const path = process.env.PATH_UPLOAD_DIR;
    if (!path) throw new Error(`PATH_UPLOAD_DIR must be defined in .env file`);

    const filePath = `${path}${filename.filename}`;
    const normalizedPath = path.normalize();

    try {
      await fs.access(normalizedPath);
    } catch {
      throw new NotFoundException(`File not found : ${filePath}`);
    }

    try {
      await fs.unlink(filePath);
      logger.debug({ message: `File ${filename.filename} has been deleted` });
      return { status: 'success', data: 'The file has been deleted.' };
    } catch (error) {
      logger.error('Error delete file', {
        error: {
          message: error.message,
          name: error.name,
          stack: error.stack,
        },
        filePath: filePath,
      });
      switch (error.code) {
        case 'ENOENT':
          throw new NotFoundException(`File not found : ${filePath}`); // HttpException(404)
        case 'EACCES':
          throw new Error(`Insufficient permits for ${filePath}`); // HttpException(403)
        default:
          throw new Error(`Deletion error : ${error.message}`); // throw personalised error
      }
    }
  }
}
