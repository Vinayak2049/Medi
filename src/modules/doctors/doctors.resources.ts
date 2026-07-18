import { ResourceDecorator as Resource, ExecutionContext, Injectable } from '@nitrostack/core';
import { DoctorsService } from './doctors.service.js';

@Injectable({ deps: [DoctorsService] })
export class DoctorsResources {
  constructor(private doctorsService: DoctorsService) {}

  @Resource({
    uri: 'doctor://{id}',
    name: 'Doctor Profile',
    description: 'Full profile for a single doctor',
    mimeType: 'application/json',
    examples: { response: { doctorId: 'doc-001', fullName: 'Dr. Anjali Menon' } }
  })
  async getDoctorResource(uri: string, ctx: ExecutionContext) {
    const doctorId = uri.split('doctor://')[1];
    const doctor = await this.doctorsService.findById(doctorId);
    if (!doctor) throw new Error(`Doctor with ID "${doctorId}" not found`);
    return { type: 'json' as const, data: doctor };
  }
}