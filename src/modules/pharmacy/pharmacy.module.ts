import { Module } from '@nitrostack/core';
import { PharmacyTools } from './pharmacy.tools.js';
import { PharmacyResources } from './pharmacy.resources.js';
import { PharmacyService } from './pharmacy.service.js';
import { DoctorsModule } from '../doctors/doctors.module.js';

@Module({
  name: 'pharmacy',
  description: 'Hospital Pharmacy — medicine inventory and prescribing',
  controllers: [PharmacyTools, PharmacyResources],
  providers: [PharmacyService],
  imports: [DoctorsModule], // needs DoctorsService to validate doctorId
  exports: [PharmacyService]
})
export class PharmacyModule {}