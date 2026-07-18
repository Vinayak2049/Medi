import { Injectable } from '@nitrostack/core';
import { DatabaseService } from '../../common/database.service.js';
import type { Patient, Gender } from '../../common/types.js';

export class NotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(`${resource} with ID "${id}" not found`);
    this.name = 'NotFoundError';
  }
}

let patientCounter = 3; // pat-001, pat-002 already seeded

export interface RegisterPatientParams {
  fullName: string;
  age: number;
  gender: Gender;
  phone: string;
  email: string;
  address: string;
  bloodGroup: string;
  symptoms: string[];
}

export interface ListPatientsOptions {
  page: number;
  limit: number;
  search?: string;
}

@Injectable({ deps: [DatabaseService] })
export class PatientsService {
  constructor(private db: DatabaseService) {}

  async register(params: RegisterPatientParams): Promise<Patient> {
    const patient: Patient = {
      patientId: `pat-${String(patientCounter++).padStart(3, '0')}`,
      fullName: params.fullName,
      age: params.age,
      gender: params.gender,
      phone: params.phone,
      email: params.email,
      address: params.address,
      bloodGroup: params.bloodGroup,
      symptoms: params.symptoms,
      assignedDepartment: null, // set later by DepartmentsService.assign()
      assignmentConfidence: null,
      registeredAt: new Date().toISOString()
    };

    this.db.patients.push(patient);
    return patient;
  }

  async findById(patientId: string): Promise<Patient | undefined> {
    return this.db.patients.find((p) => p.patientId === patientId);
  }

  async list(options: ListPatientsOptions) {
    let result = this.db.patients;

    if (options.search) {
      const q = options.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.fullName.toLowerCase().includes(q) ||
          p.phone.includes(q) ||
          p.email.toLowerCase().includes(q) ||
          (p.assignedDepartment ?? '').toLowerCase().includes(q)
      );
    }

    const sorted = [...result].sort(
      (a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime()
    );

    const total = sorted.length;
    const pages = Math.max(1, Math.ceil(total / options.limit));
    const start = (options.page - 1) * options.limit;

    return {
      patients: sorted.slice(start, start + options.limit),
      pagination: { page: options.page, limit: options.limit, total, pages }
    };
  }

  /** Called by DepartmentsService after it computes a recommendation. */
  async assignDepartment(patientId: string, department: string, confidence: 'High' | 'Medium' | 'Low'): Promise<Patient> {
    const patient = await this.findById(patientId);
    if (!patient) throw new NotFoundError('Patient', patientId);
    patient.assignedDepartment = department;
    patient.assignmentConfidence = confidence;
    return patient;
  }
}