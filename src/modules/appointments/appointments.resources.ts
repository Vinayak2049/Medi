import { ResourceDecorator as Resource, ExecutionContext } from '@nitrostack/core';
import { AppointmentsService } from './appointments.service.js';

export class AppointmentsResources {
  constructor(private appointmentsService: AppointmentsService) {}

  @Resource({
    uri: 'appointment://{id}',
    name: 'Appointment Detail',
    description: 'Full detail for a single appointment',
    mimeType: 'application/json',
    examples: { response: { appointmentId: 'apt-0001', status: 'Confirmed' } }
  })
  async getAppointmentResource(uri: string) {
    const appointmentId = uri.split('appointment://')[1];
    const appointment = await this.appointmentsService.findById(appointmentId);
    if (!appointment) throw new Error(`Appointment with ID "${appointmentId}" not found`);
    
    // ✅ Return in correct MCP format
    return {
      contents: [{
        uri,
        mimeType: 'application/json',
        text: JSON.stringify(appointment, null, 2)
      }]
    };
  }
}