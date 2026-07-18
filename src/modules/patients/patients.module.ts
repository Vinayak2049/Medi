import { Module } from '@nitrostack/core';
import { PatientsTools } from './patients.tools.js';
import { PatientsResources } from './patients.resources.js';
import { PatientsService } from './patients.service.js';
import { DatabaseModule } from '../../common/database.module.js';

@Module({
  name: 'patients',
  description: 'Patient Onboarding — register, view, and list patients',
  controllers: [PatientsTools, PatientsResources],
  providers: [PatientsService],
  imports: [DatabaseModule],
  exports: [PatientsService]
})
export class PatientsModule {}