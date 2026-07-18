import { ToolDecorator as Tool, Widget, Cache, ExecutionContext } from '@nitrostack/core';
import { z } from 'zod';
import { MedicalRecordsService, NotFoundError } from './medical-records.service.js';

const AddConsultationNoteInput = z.object({
  patientId: z.string().min(1),
  patientName: z.string().min(1),
  doctorId: z.string().min(1),
  diagnosis: z.string().min(1),
  notes: z.string().min(1),
  prescribedMedicines: z.array(z.string()).default([])
});

const ShareWithDoctorInput = z.object({
  noteId: z.string().min(1),
  sharedByDoctorId: z.string().min(1),
  sharedWithDoctorId: z.string().min(1),
  message: z.string().min(1).describe('Note or question for the receiving doctor')
});

const RequestLabReportInput = z.object({
  patientId: z.string().min(1),
  patientName: z.string().min(1),
  doctorId: z.string().min(1),
  testName: z.string().min(1).describe('e.g. "CBC", "MRI Brain", "Lipid Profile"')
});

const GetPatientMedicalRecordInput = z.object({
  patientId: z.string().min(1)
});

export class MedicalRecordsTools {
  constructor(private medicalRecordsService: MedicalRecordsService) {}

  @Tool({
    name: 'add_consultation_note',
    description: "Add a doctor's consultation note (diagnosis, notes, prescribed medicines) for a patient",
    inputSchema: AddConsultationNoteInput,
    examples: {
      request: {
        patientId: 'pat-001',
        patientName: 'Ravi Kumar',
        doctorId: 'doc-001',
        diagnosis: 'Stable angina',
        notes: 'Recommend stress test follow-up in 2 weeks',
        prescribedMedicines: ['Aspirin 75mg', 'Atorvastatin 20mg']
      },
      response: { noteId: 'note-0001', doctorName: 'Dr. Anjali Menon', createdAt: '2026-07-17T10:00:00.000Z' }
    }
  })
  async addConsultationNote(input: any, ctx: ExecutionContext) {
    try {
      return await this.medicalRecordsService.addConsultationNote(input);
    } catch (err) {
      ctx.logger.warn('addConsultationNote failed', { input, error: (err as Error).message });
      throw err;
    }
  }

  @Tool({
    name: 'share_with_doctor',
    description: 'Share an existing consultation note with another doctor for collaboration or a second opinion',
    inputSchema: ShareWithDoctorInput,
    examples: {
      request: { noteId: 'note-0001', sharedByDoctorId: 'doc-001', sharedWithDoctorId: 'doc-012', message: 'Please review renal function before I adjust dosage.' },
      response: { shareId: 'share-0001', sharedWithDoctorName: 'Dr. Sanjay Iyer' }
    }
  })
  async shareWithDoctor(input: any, ctx: ExecutionContext) {
    try {
      return await this.medicalRecordsService.shareWithDoctor(input);
    } catch (err) {
      ctx.logger.warn('shareWithDoctor failed', { input, error: (err as Error).message });
      throw err;
    }
  }

  @Tool({
    name: 'request_lab_report',
    description: 'Request a lab test/report for a patient',
    inputSchema: RequestLabReportInput,
    examples: {
      request: { patientId: 'pat-001', patientName: 'Ravi Kumar', doctorId: 'doc-001', testName: 'Lipid Profile' },
      response: { requestId: 'lab-0001', status: 'Requested' }
    }
  })
  async requestLabReport(input: any, ctx: ExecutionContext) {
    try {
      return await this.medicalRecordsService.requestLabReport(input);
    } catch (err) {
      ctx.logger.warn('requestLabReport failed', { input, error: (err as Error).message });
      throw err;
    }
  }

  // Not in the original tool list, but required for the medical-record-viewer
  // widget to have something to render — the three tools above only ever
  // add data, none of them read it back out.
  @Tool({
    name: 'get_patient_medical_record',
    description: "Get a patient's full medical record: consultation notes, shared notes, and lab report requests",
    inputSchema: GetPatientMedicalRecordInput,
    examples: {
      request: { patientId: 'pat-001' },
      response: { patientId: 'pat-001', consultationNotes: [], sharedNotes: [], labReports: [] }
    }
  })
  @Widget('medical-record-viewer')
  async getPatientMedicalRecord(input: any) {
    return this.medicalRecordsService.getPatientRecord(input.patientId);
  }
}