import { Module } from '@nitrostack/core';
import { DatabaseService } from './database.service.js';

/**
 * Wraps DatabaseService as a global provider so every feature module
 * (patients, doctors, appointments, medical-records, pharmacy, reports,
 * communication, departments) can inject the same in-memory data store
 * without each one re-declaring it as a provider.
 */
@Module({
  name: 'database',
  description: 'Shared in-memory data store for the whole Hospital AI Assistant',
  controllers: [],
  providers: [DatabaseService],
  imports: [],
  exports: [DatabaseService]
})
export class DatabaseModule {}