import { ToolDecorator as Tool, Widget, ExecutionContext } from '@nitrostack/core';
import { z } from 'zod';
import { PatientsService, NotFoundError } from './patients.service.js';

const GenderEnum = z.enum(['Male', 'Female', 'Other']);

const RegisterPatientInput = z.object({
  fullName: z.string().min(1),
  age: z.number().int().min(0).max(130),
  gender: GenderEnum,
  phone: z.string().min(1),
  email: z.string().email(),
  address: z.string().min(1),
  bloodGroup: z.string().min(1).describe('e.g. "O+", "B+", "AB-"'),
  symptoms: z.array(z.string()).default([]).describe('Reported symptoms at registration, e.g. ["fever", "cough"]')
});

const GetPatientInput = z.object({
  patientId: z.string().min(1)
});

const ListPatientsInput = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(10),
  search: z.string().optional().describe('Search by name, phone, email, or assigned department')
});

export class PatientsTools {
  constructor(private patientsService: PatientsService) {}

  @Tool({
    name: 'register_patient',
    description: 'Register a new patient (onboarding). Does not assign a department — call assign_department separately with the returned patientId.',
    inputSchema: RegisterPatientInput,
    examples: {
      request: {
        fullName: 'Ravi Kumar',
        age: 45,
        gender: 'Male',
        phone: '+91 98765 43210',
        email: 'ravi.kumar@example.com',
        address: 'Panampilly Nagar, Kochi',
        bloodGroup: 'O+',
        symptoms: ['chest pain', 'shortness of breath']
      },
      response: { patientId: 'pat-003', fullName: 'Ravi Kumar', assignedDepartment: null }
    }
  })
  @Widget('patient-dashboard')
  async registerPatient(input: any, ctx: ExecutionContext) {
    ctx.logger.info('Registering patient', { fullName: input.fullName });
    return this.patientsService.register(input);
  }

  @Tool({
    name: 'get_patient',
    description: 'Get a single patient by ID, including their assigned department if set',
    inputSchema: GetPatientInput,
    examples: {
      request: { patientId: 'pat-001' },
      response: { patientId: 'pat-001', fullName: 'Ravi Kumar', assignedDepartment: 'Cardiology' }
    }
  })
  @Widget('patient-dashboard')
  async getPatient(input: any, ctx: ExecutionContext) {
    const patient = await this.patientsService.findById(input.patientId);
    if (!patient) {
      ctx.logger.warn('Patient not found', { patientId: input.patientId });
      throw new NotFoundError('Patient', input.patientId);
    }
    return patient;
  }

  @Tool({
    name: 'list_patients',
    description: 'List/search registered patients with pagination',
    inputSchema: ListPatientsInput,
    examples: {
      request: { page: 1, limit: 10 },
      response: {
        patients: [{ patientId: 'pat-001', fullName: 'Ravi Kumar', assignedDepartment: 'Cardiology' }],
        pagination: { page: 1, limit: 10, total: 2, pages: 1 }
      }
    }
  })
  @Widget('patient-dashboard')
  async listPatients(input: any, ctx: ExecutionContext) {
    ctx.logger.info('Listing patients', { search: input.search });
    return this.patientsService.list(input);
  }
}