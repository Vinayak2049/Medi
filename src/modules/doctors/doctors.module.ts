// doctors.module.ts
import { Module } from '@nitrostack/core';
import { DoctorsService } from './doctors.service.js';
import { DoctorsResources } from './doctors.resources.js';
import { DoctorsTools } from './doctors.tools.js';

@Module({
  name: 'doctors',
  description: 'Doctor management module',
  providers: [
    DoctorsService,      // ✅ Service
    DoctorsResources,    // ✅ Resources (must be in providers!)
    DoctorsTools         // ✅ Tools (must be in providers!)
  ],
  exports: [
    DoctorsService,
    DoctorsResources,
    DoctorsTools
  ]
})
export class DoctorsModule {}