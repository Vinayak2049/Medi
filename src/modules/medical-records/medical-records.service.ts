import { Injectable } from '@nitrostack/core';
import { DatabaseService } from '../../common/database.service.js';
import { DoctorsService, NotFoundError } from '../doctors/doctors.service.js';
import type {
  ConsultationNote,
  SharedNote,
  LabReportRequest,
  PatientMedicalRecord
} from '../../common/types.js';

export { NotFoundError };

let noteCounter = 1;
let shareCounter = 1;
let labRequestCounter = 1;

@Injectable({ deps: [DatabaseService, DoctorsService] })
export class MedicalRecordsService {
  constructor(private db: DatabaseService, private doctorsService: DoctorsService) {}

  async addConsultationNote(params: {
    patientId: string;
    patientName: string;
    doctorId: string;
    diagnosis: string;
    notes: string;
    prescribedMedicines: string[];
  }): Promise<ConsultationNote> {
    const doctor = await this.doctorsService.findById(params.doctorId);
    if (!doctor) throw new NotFoundError('Doctor', params.doctorId);

    const note: ConsultationNote = {
      noteId: `note-${String(noteCounter++).padStart(4, '0')}`,
      patientId: params.patientId,
      patientName: params.patientName,
      doctorId: doctor.doctorId,
      doctorName: doctor.fullName,
      department: doctor.department,
      diagnosis: params.diagnosis,
      notes: params.notes,
      prescribedMedicines: params.prescribedMedicines,
      createdAt: new Date().toISOString()
    };

    this.db.consultationNotes.push(note);
    return note;
  }

  async shareWithDoctor(params: {
    noteId: string;
    sharedByDoctorId: string;
    sharedWithDoctorId: string;
    message: string;
  }): Promise<SharedNote> {
    const note = this.db.consultationNotes.find((n) => n.noteId === params.noteId);
    if (!note) throw new NotFoundError('Consultation note', params.noteId);

    const targetDoctor = await this.doctorsService.findById(params.sharedWithDoctorId);
    if (!targetDoctor) throw new NotFoundError('Doctor', params.sharedWithDoctorId);

    const share: SharedNote = {
      shareId: `share-${String(shareCounter++).padStart(4, '0')}`,
      noteId: params.noteId,
      sharedByDoctorId: params.sharedByDoctorId,
      sharedWithDoctorId: targetDoctor.doctorId,
      sharedWithDoctorName: targetDoctor.fullName,
      message: params.message,
      sharedAt: new Date().toISOString()
    };

    this.db.sharedNotes.push(share);
    return share;
  }

  async requestLabReport(params: {
    patientId: string;
    patientName: string;
    doctorId: string;
    testName: string;
  }): Promise<LabReportRequest> {
    const doctor = await this.doctorsService.findById(params.doctorId);
    if (!doctor) throw new NotFoundError('Doctor', params.doctorId);

    const request: LabReportRequest = {
      requestId: `lab-${String(labRequestCounter++).padStart(4, '0')}`,
      patientId: params.patientId,
      patientName: params.patientName,
      doctorId: doctor.doctorId,
      testName: params.testName,
      status: 'Requested',
      requestedAt: new Date().toISOString()
    };

    this.db.labReportRequests.push(request);
    return request;
  }

  async getPatientRecord(patientId: string): Promise<PatientMedicalRecord> {
    const consultationNotes = this.db.consultationNotes.filter((n) => n.patientId === patientId);
    const noteIds = new Set(consultationNotes.map((n) => n.noteId));
    const sharedNotes = this.db.sharedNotes.filter((s) => noteIds.has(s.noteId));
    const labReports = this.db.labReportRequests.filter((l) => l.patientId === patientId);

    const patientName = consultationNotes[0]?.patientName ?? labReports[0]?.patientName ?? patientId;

    return { patientId, patientName, consultationNotes, sharedNotes, labReports };
  }

  async findNoteById(noteId: string): Promise<ConsultationNote | undefined> {
    return this.db.consultationNotes.find((n) => n.noteId === noteId);
  }
}