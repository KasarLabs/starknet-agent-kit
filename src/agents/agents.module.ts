import { Module } from '@nestjs/common';
import { AgentService } from './services/agent.service';
import { AgentsController } from './agents.controller';
import { ConfigModule } from '../config/config.module';
import { WalletController } from './wallet.controller';
import { WalletService } from './services/wallet.service';

@Module({
  imports: [ConfigModule],
  providers: [AgentService, WalletService],
  controllers: [AgentsController, WalletController],
  exports: [AgentService, WalletService],
})
export class AgentsModule {}
