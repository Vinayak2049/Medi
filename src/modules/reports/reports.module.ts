import { Module } from '@nitrostack/core';
import { ReportsTools } from './reports.tools.js';
import { ReportsService } from './reports.service.js';
import { AppointmentsModule } from '../appointments/appointments.module.js';
import { MedicalRecordsModule } from '../medical-records/medical-records.module.js';

@Module({
  name: 'reports',
  description: 'Reports & Documents — generate invoice and prescription PDFs',
  controllers: [ReportsTools], // no .resources.ts for this module, per the agreed file tree
  providers: [ReportsService],
  imports: [AppointmentsModule, MedicalRecordsModule], // needs AppointmentsService + MedicalRecordsService
  exports: [ReportsService]
})
export class ReportsModule {}