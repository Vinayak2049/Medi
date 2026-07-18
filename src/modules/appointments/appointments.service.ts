import { Injectable } from '@nitrostack/core';
import { DatabaseService } from '../../common/database.service.js';
import { DoctorsService } from '../doctors/doctors.service.js';
import type { Appointment, AppointmentStatus } from '../../common/types.js';

export class NotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(`${resource} with ID "${id}" not found`);
    this.name = 'NotFoundError';
  }
}

export class SlotUnavailableError extends Error {
  constructor(doctorId: string, time: string) {
    super(`Doctor "${doctorId}" has no free slot at ${time}`);
    this.name = 'SlotUnavailableError';
  }
}

let appointmentCounter = 1;

@Injectable({ deps: [DatabaseService, DoctorsService] })
export class AppointmentsService {
  constructor(private db: DatabaseService, private doctorsService: DoctorsService) {}

  async book(params: { patientId: string; patientName: string; doctorId: string; date: string; time: string }): Promise<Appointment> {
    const doctor = await this.doctorsService.findById(params.doctorId);
    if (!doctor) throw new NotFoundError('Doctor', params.doctorId);

    const slot = doctor.availableSlots.find((s) => s.time === params.time);
    if (!slot || slot.occupied) throw new SlotUnavailableError(params.doctorId, params.time);

    slot.occupied = true; // mark taken in the shared in-memory data

    const appointment: Appointment = {
      appointmentId: `apt-${String(appointmentCounter++).padStart(4, '0')}`,
      patientId: params.patientId,
      patientName: params.patientName,
      doctorId: doctor.doctorId,
      doctorName: doctor.fullName,
      department: doctor.department,
      date: params.date,
      time: params.time,
      status: 'Confirmed',
      consultationFee: doctor.consultationFee,
      createdAt: new Date().toISOString()
    };

    this.db.appointments.push(appointment);
    return appointment;
  }

  async list(filter: { patientId?: string; doctorId?: string; status?: AppointmentStatus; page: number; limit: number }) {
    let result = this.db.appointments;
    if (filter.patientId) result = result.filter((a) => a.patientId === filter.patientId);
    if (filter.doctorId) result = result.filter((a) => a.doctorId === filter.doctorId);
    if (filter.status) result = result.filter((a) => a.status === filter.status);

    const total = result.length;
    const pages = Math.max(1, Math.ceil(total / filter.limit));
    const start = (filter.page - 1) * filter.limit;
    return {
      appointments: result.slice(start, start + filter.limit),
      pagination: { page: filter.page, limit: filter.limit, total, pages }
    };
  }

  async findById(appointmentId: string): Promise<Appointment | undefined> {
    return this.db.appointments.find((a) => a.appointmentId === appointmentId);
  }
}