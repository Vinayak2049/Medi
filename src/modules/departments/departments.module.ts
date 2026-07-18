import { Module } from '@nitrostack/core';
import { DepartmentsTools } from './departments.tools.js';
import { DepartmentsResources } from './departments.resources.js';
import { DepartmentsService } from './departments.service.js';
import { PatientsModule } from '../patients/patients.module.js';

@Module({
  name: 'departments',
  description: 'Intelligent Department Assignment — recommend a department from reported symptoms',
  controllers: [DepartmentsTools, DepartmentsResources],
  providers: [DepartmentsService],
  imports: [PatientsModule], // needs PatientsService to save the assignment onto a patient
  exports: [DepartmentsService]
})
export class DepartmentsModule {}