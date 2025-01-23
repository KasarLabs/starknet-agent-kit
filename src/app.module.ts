import { Module } from '@nestjs/common';
import { AgentsModule } from './agents/agents.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ApiKeyGuard } from './lib/guard/ApikeyGuard';
import { ConfigModule } from './config/config.module';

@Module({
  imports: [ConfigModule, AgentsModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ApiKeyGuard,
    },
  ],
})
export class AppModule {}
