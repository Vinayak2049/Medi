import { Module } from '@nitrostack/core';
import { PatientsTools } from './patients.tools.js';
import { PatientsResources } from './patients.resources.js';
import { PatientsService } from './patients.service.js';

@Module({
  name: 'patients',
  description: 'Patient Onboarding — register, view, and list patients',
  controllers: [PatientsTools, PatientsResources],
  providers: [PatientsService],
  imports: [],
  exports: [PatientsService]
})
export class PatientsModule {}