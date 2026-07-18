import { Module } from '@nitrostack/core';
import { CommunicationTools } from './communication.tools.js';
import { CommunicationService } from './communication.service.js';
import { AppointmentsModule } from '../appointments/appointments.module.js';
import { ReportsModule } from '../reports/reports.module.js';
import { DatabaseModule } from '../../common/database.module.js';

@Module({
  name: 'communication',
  description: 'Email/phone notifications — appointment confirmations, reminders, report-ready alerts (simulated)',
  controllers: [CommunicationTools],
  providers: [CommunicationService],
  imports: [DatabaseModule, AppointmentsModule, ReportsModule], // needs DatabaseService directly
  exports: [CommunicationService]
})
export class CommunicationModule {}