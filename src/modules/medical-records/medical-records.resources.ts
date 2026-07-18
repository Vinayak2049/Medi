import { ResourceDecorator as Resource, Widget, ExecutionContext } from '@nitrostack/core';
import { MedicalRecordsService } from './medical-records.service.js';

export class MedicalRecordsResources {
  constructor(private medicalRecordsService: MedicalRecordsService) {}

  @Resource({
    uri: 'medical-record://{patientId}',
    name: 'Patient Medical Record',
    description: 'Consultation notes, shared notes, and lab report requests for a patient',
    mimeType: 'application/json',
    examples: {
      response: { patientId: 'pat-001', consultationNotes: [], sharedNotes: [], labReports: [] }
    }
  })
  @Widget('medical-record-viewer')
  async getMedicalRecordResource(uri: string) {
    const patientId = uri.split('medical-record://')[1];
    const record = await this.medicalRecordsService.getPatientRecord(patientId);
    // ✅ CORRECT FORMAT
    return {
      contents: [{
        uri,
        mimeType: 'application/json',
        text: JSON.stringify(record, null, 2)
      }]
    };
  }
}