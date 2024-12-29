import { Module } from '@nestjs/common';
import { GreeterService } from './greeter.service';
import { GreeterUpdate } from './greeter.update';
import { GreeterWizard } from './wizard/greeter.wizard';

@Module({
  providers: [GreeterUpdate, GreeterWizard, GreeterService],
  exports: [GreeterService],
})
export class GreeterModule {}
