import { ToolDecorator as Tool, Widget, Cache, ExecutionContext } from '@nitrostack/core';
import { z } from 'zod';
import { AppointmentsService, NotFoundError, SlotUnavailableError } from './appointments.service.js';

const BookAppointmentInput = z.object({
  patientId: z.string().min(1),
  patientName: z.string().min(1),
  doctorId: z.string().min(1),
  date: z.string().min(1).describe('Appointment date, "YYYY-MM-DD"'),
  time: z.string().min(1).describe('Slot time exactly as returned by get_doctor_availability, e.g. "9:00 AM"')
});

const ListAppointmentsInput = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(10),
  patientId: z.string().optional(),
  doctorId: z.string().optional(),
  status: z.enum(['Pending', 'Confirmed', 'Cancelled', 'Completed']).optional()
});

const GetAppointmentInput = z.object({
  appointmentId: z.string().min(1)
});

export class AppointmentsTools {
  constructor(private appointmentsService: AppointmentsService) {}

  @Tool({
    name: 'book_appointment',
    description: 'Book an appointment with a doctor at a specific date and free slot time',
    inputSchema: BookAppointmentInput,
    examples: {
      request: { patientId: 'pat-001', patientName: 'Ravi Kumar', doctorId: 'doc-001', date: '2026-07-20', time: '9:00 AM' },
      response: { appointmentId: 'apt-0001', status: 'Confirmed', consultationFee: 900 }
    }
  })
  @Widget('appointment-confirmation')
  async bookAppointment(input: any, ctx: ExecutionContext) {
    try {
      return await this.appointmentsService.book(input);
    } catch (err) {
      ctx.logger.warn('bookAppointment failed', { input, error: (err as Error).message });
      throw err;
    }
  }

  @Tool({
    name: 'list_appointments',
    description: 'List appointments, optionally filtered by patient, doctor, or status',
    inputSchema: ListAppointmentsInput,
    examples: {
      request: { patientId: 'pat-001', page: 1, limit: 10 },
      response: { appointments: [{ appointmentId: 'apt-0001', status: 'Confirmed' }], pagination: { page: 1, limit: 10, total: 1, pages: 1 } }
    }
  })
  async listAppointments(input: any) {
    return this.appointmentsService.list(input);
  }

  @Tool({
    name: 'get_appointment',
    description: 'Get a single appointment by ID',
    inputSchema: GetAppointmentInput,
    examples: {
      request: { appointmentId: 'apt-0001' },
      response: { appointmentId: 'apt-0001', doctorName: 'Dr. Anjali Menon', status: 'Confirmed' }
    }
  })
  @Widget('appointment-confirmation')
  async getAppointment(input: any, ctx: ExecutionContext) {
    const appointment = await this.appointmentsService.findById(input.appointmentId);
    if (!appointment) {
      ctx.logger.warn('Appointment not found', { appointmentId: input.appointmentId });
      throw new NotFoundError('Appointment', input.appointmentId);
    }
    return appointment;
  }
}