import { Module, ConfigModule, McpApp } from '@nitrostack/core';
import { DatabaseModule } from './common/database.module.js';
import { PatientsModule } from './modules/patients/patients.module.js';
import { DepartmentsModule } from './modules/departments/departments.module.js';
import { DoctorsModule } from './modules/doctors/doctors.module.js';
import { AppointmentsModule } from './modules/appointments/appointments.module.js';
import { MedicalRecordsModule } from './modules/medical-records/medical-records.module.js';
import { ReportsModule } from './modules/reports/reports.module.js';
import { PharmacyModule } from './modules/pharmacy/pharmacy.module.js';
import { CommunicationModule } from './modules/communication/communication.module.js';
import { SystemHealthCheck } from './health/system.health.js';
import { DatabaseHealthCheck } from './health/database.health.js';

@McpApp({
  module: AppModule,
  server: {
    name: 'medimcp',
    version: '1.0.0'
  }
})
@Module({
  name: 'app',
  description: 'Root application module',
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    PatientsModule,
    DepartmentsModule,
    DoctorsModule,
    AppointmentsModule,
    MedicalRecordsModule,
    ReportsModule,
    PharmacyModule,
    CommunicationModule
  ],
  providers: [
    SystemHealthCheck,
    DatabaseHealthCheck
  ],
  exports: [
    DatabaseModule,
    PatientsModule,
    DepartmentsModule,
    DoctorsModule,
    AppointmentsModule,
    MedicalRecordsModule,
    ReportsModule,
    PharmacyModule,
    CommunicationModule
  ]
})
export class AppModule {}