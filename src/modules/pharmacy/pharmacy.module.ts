import { Module } from '@nitrostack/core';
import { PharmacyTools } from './pharmacy.tools.js';
import { PharmacyResources } from './pharmacy.resources.js';
import { PharmacyService } from './pharmacy.service.js';
import { DoctorsModule } from '../doctors/doctors.module.js';
import { DatabaseModule } from '../../common/database.module.js';

@Module({
  name: 'pharmacy',
  description: 'Hospital Pharmacy — medicine inventory and prescribing',
  controllers: [PharmacyTools, PharmacyResources],
  providers: [PharmacyService],
  imports: [DatabaseModule, DoctorsModule], // needs DatabaseService directly + DoctorsService to validate doctorId
  exports: [PharmacyService]
})
export class PharmacyModule {}