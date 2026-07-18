import { Module } from '@nitrostack/core';
import { CommunicationTools } from './communication.tools.js';
import { CommunicationService } from './communication.service.js';
import { AppointmentsModule } from '../appointments/appointments.module.js';
import { ReportsModule } from '../reports/reports.module.js';

@Module({
  name: 'communication',
  description: 'Email/phone notifications — appointment confirmations, reminders, report-ready alerts (simulated)',
  controllers: [CommunicationTools],
  providers: [CommunicationService],
  imports: [AppointmentsModule, ReportsModule],
  exports: [CommunicationService]
})
export class CommunicationModule {}