import { Module } from '@nitrostack/core';
import { AppointmentsTools } from './appointments.tools.js';
import { AppointmentsResources } from './appointments.resources.js';
import { AppointmentsService } from './appointments.service.js';
import { DoctorsModule } from '../doctors/doctors.module.js';

@Module({
  name: 'appointments',
  description: 'Appointment Management — book, list, and view appointments',
  controllers: [AppointmentsTools, AppointmentsResources],
  providers: [AppointmentsService],
  imports: [DoctorsModule], // needs DoctorsService to validate doctorId + read fee/slots
  exports: [AppointmentsService]
})
export class AppointmentsModule {}