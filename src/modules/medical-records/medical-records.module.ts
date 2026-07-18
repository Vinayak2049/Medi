import { Module } from '@nitrostack/core';
import { MedicalRecordsTools } from './medical-records.tools.js';
import { MedicalRecordsResources } from './medical-records.resources.js';
import { MedicalRecordsService } from './medical-records.service.js';
import { DoctorsModule } from '../doctors/doctors.module.js';
import { DatabaseModule } from '../../common/database.module.js';

@Module({
  name: 'medical-records',
  description: 'Medical Records & Doctor Collaboration — consultation notes, shared notes, lab report requests',
  controllers: [MedicalRecordsTools, MedicalRecordsResources],
  providers: [MedicalRecordsService],
  imports: [DatabaseModule, DoctorsModule], // needs DatabaseService directly + DoctorsService to validate doctorId / resolve doctor names
  exports: [MedicalRecordsService]
})
export class MedicalRecordsModule {}