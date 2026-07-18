import { ResourceDecorator as Resource, Widget, ExecutionContext } from '@nitrostack/core';
import { PatientsService } from './patients.service.js';

export class PatientsResources {
  constructor(private patientsService: PatientsService) {}

  @Resource({
    uri: 'patient://{id}',
    name: 'Patient Record',
    description: 'Full patient record including assigned department',
    mimeType: 'application/json',
    examples: {
      response: { patientId: 'pat-001', fullName: 'Ravi Kumar', assignedDepartment: 'Cardiology' }
    }
  })
  @Widget('patient-dashboard')
  async getPatientResource(uri: string) {
    const patientId = uri.split('patient://')[1];
    const patient = await this.patientsService.findById(patientId);
    if (!patient) throw new Error(`Patient with ID "${patientId}" not found`);
    return { type: 'json' as const, data: patient };
  }
}