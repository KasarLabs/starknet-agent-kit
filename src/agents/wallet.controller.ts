import {
  Body,
  Controller,
  Logger,
  NotFoundException,
  OnModuleInit,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { StarknetAgent } from '../lib/agent/starknetAgent';
import { ConfigurationService } from '../config/configuration';
import { WalletService } from './services/wallet.service';
import { AgentRequestDTO } from './dto/agents';
import { FileTypeGuard } from 'src/lib/guard/file-validator.guard';
import { FastifyRequest } from 'fastify';
import { promises as fs } from 'fs';
import path from 'path';

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

  @Post('upload_large_file')
  @UseGuards(new FileTypeGuard(['image/jpeg', 'image/png']))
  async uploadFile(@Req() req: FastifyRequest) {
    const logger = new Logger('Upload service');
    logger.debug({ message: 'The file has been uploaded' });
    return {
      status: 'success',
      data: 'The file has been uploaded.',
    };
  }

  @Post('delete_large_file')
  async deleteUploadFile(@Body() filename: { filename: string }) {
    const logger = new Logger('Delete service');

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
