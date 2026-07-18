import { HealthCheck, HealthCheckInterface, HealthCheckResult, Injectable } from '@nitrostack/core';
import { DatabaseService } from '../common/database.service.js';

/**
 * `@HealthCheck` is a CLASS decorator: it must decorate the class itself
 * (not a method), take an options OBJECT (`{ name, description?, interval? }`,
 * not a bare string), and the class must implement `check(): Promise<HealthCheckResult>`
 * — that's the method name the framework calls when it resolves the health check.
 */
@HealthCheck({ name: 'system', description: 'Process uptime and memory usage' })
@Injectable()
export class SystemHealthCheck implements HealthCheckInterface {
  async check(): Promise<HealthCheckResult> {
    const uptime = process.uptime();
    const memory = process.memoryUsage();

    return {
      status: uptime > 0 ? 'up' : 'down',
      message: 'System is operational',
      details: {
        uptime: `${Math.floor(uptime)}s`,
        memory: `${Math.round(memory.heapUsed / 1024 / 1024)}MB`
      }
    };
  }
}

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
