import { Module } from '@nestjs/common';
import { AgentsModule } from './agents/agents.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AgentResponseInterceptor } from './lib/interceptors/response';
import { ApiKeyGuard } from './lib/guard/ApikeyGuard';
import { ConfigModule } from './config/config.module';
import { CleanupModule } from './common/cleanup/cleanup.module';

@Module({
  imports: [ConfigModule, AgentsModule, CleanupModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ApiKeyGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AgentResponseInterceptor,
    },
  ],
})
export class AppModule {}
