import { Injectable } from '@nitrostack/core';
import { DatabaseService } from '../../common/database.service.js';
import type { Doctor, DoctorStatus } from '../../common/types.js';

export class NotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(`${resource} with ID "${id}" not found`);
    this.name = 'NotFoundError';
  }
}

export interface ListDoctorsOptions {
  page: number;
  limit: number;
  department?: string;
  search?: string;
  availability?: DoctorStatus;
  sortBy?: 'name' | 'experience' | 'rating' | 'fee';
}

@Injectable({ deps: [DatabaseService] })
export class DoctorsService {
  constructor(private db: DatabaseService) {}

  private paginate(list: Doctor[], page: number, limit: number) {
    const total = list.length;
    const pages = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;
    return {
      doctors: list.slice(start, start + limit),
      pagination: { page, limit, total, pages }
    };
  }

  async list(options: ListDoctorsOptions) {
    let result = this.db.doctors;

    if (options.department) {
      result = result.filter((d) => d.department === options.department);
    }
    if (options.availability) {
      result = result.filter((d) => d.status === options.availability);
    }
    if (options.search) {
      const q = options.search.toLowerCase();
      result = result.filter(
        (d) =>
          d.fullName.toLowerCase().includes(q) ||
          d.specialization.toLowerCase().includes(q) ||
          d.department.toLowerCase().includes(q) ||
          d.qualification.toLowerCase().includes(q)
      );
    }

    const sorted = [...result];
    switch (options.sortBy) {
      case 'experience':
        sorted.sort((a, b) => b.yearsOfExperience - a.yearsOfExperience);
        break;
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case 'fee':
        sorted.sort((a, b) => a.consultationFee - b.consultationFee);
        break;
      default:
        sorted.sort((a, b) => a.fullName.localeCompare(b.fullName));
    }

    return this.paginate(sorted, options.page, options.limit);
  }

  async findById(doctorId: string): Promise<Doctor | undefined> {
    return this.db.doctors.find((d) => d.doctorId === doctorId);
  }

  async getAvailability(doctorId: string) {
    const doctor = await this.findById(doctorId);
    if (!doctor) throw new NotFoundError('Doctor', doctorId);
    return {
      doctorId: doctor.doctorId,
      fullName: doctor.fullName,
      status: doctor.status,
      currentlyAvailable: doctor.currentlyAvailable,
      todaysSchedule: doctor.todaysSchedule,
      slots: doctor.availableSlots,
      nextAvailableSlot: doctor.availableSlots.find((s) => !s.occupied)?.time ?? null
    };
  }
}