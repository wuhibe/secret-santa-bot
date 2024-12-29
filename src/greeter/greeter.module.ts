import { Module } from '@nestjs/common';
import { GreeterService } from './greeter.service';
import { GreeterUpdate } from './greeter.update';
import { EditProfileWizard } from './wizard/edit-profile.wizard';
import { GreeterWizard } from './wizard/greeter.wizard';

@Module({
  providers: [GreeterUpdate, GreeterWizard, GreeterService, EditProfileWizard],
  exports: [GreeterService],
})
export class GreeterModule {}
