import { Global, Module } from '@nestjs/common';
import { ConfigurationService } from './configuration';

@Global()
@Module({
  providers: [
    {
      provide: ConfigurationService,
      useValue: new ConfigurationService(process.env),
    },
  ],
  exports: [ConfigurationService],
})
export class ConfigModule {}
