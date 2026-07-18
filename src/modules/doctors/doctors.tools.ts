import { ToolDecorator as Tool, Widget, Cache, ExecutionContext, Injectable } from '@nitrostack/core';
import { z } from 'zod';
import { DoctorsService, NotFoundError } from './doctors.service.js';

const DoctorStatusEnum = z.enum(['Available', 'Busy', 'In Surgery', 'Offline', 'On Leave']);

const ListDoctorsInput = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(10),
  department: z.string().optional(),
  search: z.string().optional().describe('Free-text search across name, specialization, department, qualification'),
  availability: DoctorStatusEnum.optional(),
  sortBy: z.enum(['name', 'experience', 'rating', 'fee']).optional().default('name')
});

const GetDoctorInput = z.object({
  doctorId: z.string().min(1)
});

@Injectable({ deps: [DoctorsService] })
export class DoctorsTools {
  constructor(private doctorsService: DoctorsService) {}

  @Tool({
    name: 'list_doctors',
    description: 'List/search/filter doctors with pagination, department, availability, and sort options',
    inputSchema: ListDoctorsInput,
    examples: {
      request: { page: 1, limit: 10, department: 'Cardiology', sortBy: 'rating' },
      response: {
        doctors: [{ doctorId: 'doc-001', fullName: 'Dr. Anjali Menon', department: 'Cardiology' }],
        pagination: { page: 1, limit: 10, total: 1, pages: 1 }
      }
    }
  })
  @Widget('doctor-directory')
  @Cache({ ttl: 30, key: (i: any) => `list_doctors:${i.page}:${i.limit}:${i.department}:${i.search}:${i.availability}:${i.sortBy}` })
  async listDoctors(input: any, ctx: ExecutionContext) {
    ctx.logger.info('Listing doctors', { input });
    return this.doctorsService.list(input);
  }

  @Tool({
    name: 'get_doctor',
    description: 'Get the full profile of a single doctor by ID',
    inputSchema: GetDoctorInput,
    examples: {
      request: { doctorId: 'doc-001' },
      response: { doctorId: 'doc-001', fullName: 'Dr. Anjali Menon' }
    }
  })
  @Widget('doctor-directory')
  async getDoctor(input: any, ctx: ExecutionContext) {
    const doctor = await this.doctorsService.findById(input.doctorId);
    if (!doctor) {
      ctx.logger.warn('Doctor not found', { doctorId: input.doctorId });
      throw new NotFoundError('Doctor', input.doctorId);
    }
    return doctor;
  }

  @Tool({
    name: 'get_doctor_availability',
    description: "Get a doctor's current status, today's schedule, and appointment slots",
    inputSchema: GetDoctorInput,
    examples: {
      request: { doctorId: 'doc-001' },
      response: { doctorId: 'doc-001', status: 'Available', nextAvailableSlot: '9:00 AM' }
    }
  })
  async getDoctorAvailability(input: any, ctx: ExecutionContext) {
    try {
      return await this.doctorsService.getAvailability(input.doctorId);
    } catch (err) {
      ctx.logger.warn('getDoctorAvailability failed', { doctorId: input.doctorId });
      throw err;
    }
  }
}