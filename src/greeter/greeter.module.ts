import { Module } from '@nestjs/common';
import { GreeterUpdate } from './greeter.update';
import { GreeterWizard } from './wizard/greeter.wizard';

@Module({
  providers: [GreeterUpdate, GreeterWizard],
})
export class GreeterModule {}
