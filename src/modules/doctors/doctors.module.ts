import { Module } from '@nitrostack/core';
import { DoctorsTools } from './doctors.tools.js';
import { DoctorsResources } from './doctors.resources.js';
import { DoctorsService } from './doctors.service.js';

@Module({
  name: 'doctors',
  description: 'Doctor Management — list, view, and check availability for doctors',
  controllers: [DoctorsTools, DoctorsResources],
  providers: [DoctorsService],
  imports: [],
  exports: [DoctorsService]
})
export class DoctorsModule {}