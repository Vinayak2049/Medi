import { McpApp, Module, ConfigModule } from '@nitrostack/core';

import { SystemHealthCheck, DatabaseHealthCheck } from './health/system.health.js';

import { DatabaseModule } from './common/database.module.js';

// Member 1 — Patient Onboarding & Department Assignment
import { PatientsModule } from './modules/patients/patients.module.js';
import { DepartmentsModule } from './modules/departments/departments.module.js';

// Member 2 — Doctor & Appointment Management
import { DoctorsModule } from './modules/doctors/doctors.module.js';
import { AppointmentsModule } from './modules/appointments/appointments.module.js';

// Member 3 — Medical Records & Reports
import { MedicalRecordsModule } from './modules/medical-records/medical-records.module.js';
import { ReportsModule } from './modules/reports/reports.module.js';

// Member 4 — Pharmacy & Communication
import { PharmacyModule } from './modules/pharmacy/pharmacy.module.js';
import { CommunicationModule } from './modules/communication/communication.module.js';

/**
 * Root Application Module
 *
 * This is the main module that bootstraps the MCP server.
 * It registers all feature modules and health checks.
 */
@McpApp({
  module: AppModule,
  server: {
    name: 'my-server',
    version: '1.0.0'
  },
  logging: {
    level: 'info'
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
    // Health Checks
    SystemHealthCheck,
    DatabaseHealthCheck
  ]
})
export class AppModule {}