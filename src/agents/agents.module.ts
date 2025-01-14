import { Module } from '@nestjs/common';
import { AgentService } from './services/agent.service';
import { AgentsController } from './agents.controller';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [ConfigModule],
  providers: [AgentService],
  controllers: [AgentsController],
  exports: [AgentService],
})
export class AgentsModule {}
