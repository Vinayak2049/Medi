import { HealthCheck, HealthCheckInterface, HealthCheckResult, Injectable } from '@nitrostack/core';
import { DatabaseService } from '../common/database.service.js';

@HealthCheck({ name: 'database', description: 'In-memory data store connectivity' })
@Injectable({ deps: [DatabaseService] })
export class DatabaseHealthCheck implements HealthCheckInterface {
  constructor(private db: DatabaseService) {}
  async check(): Promise<HealthCheckResult> {
    try {
      const ok =
        Array.isArray(this.db.doctors) &&
        Array.isArray(this.db.patients) &&
        Array.isArray(this.db.appointments);
      return {
        status: ok ? 'up' : 'down',
        message: ok ? 'In-memory data store is responsive' : 'Data store missing expected collections',
        details: {
          doctors: this.db.doctors.length,
          patients: this.db.patients.length,
          appointments: this.db.appointments.length,
          medicines: this.db.medicines.length
        }
      };
    } catch (error) {
      return {
        status: 'down',
        message: 'Data store check failed',
        details: { error: (error as Error).message }
      };
    }
  }
}