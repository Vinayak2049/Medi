import { Injectable } from '@nitrostack/core';
import PDFDocument from 'pdfkit';
import { DatabaseService } from '../../common/database.service.js';
import { AppointmentsService, NotFoundError } from '../appointments/appointments.service.js';
import { MedicalRecordsService } from '../medical-records/medical-records.service.js';
import type { GeneratedReport, InvoiceDetails } from '../../common/types.js';

export { NotFoundError };

let reportCounter = 1;

function renderPdfToBase64(render: (doc: PDFKit.PDFDocument) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks).toString('base64')));
    doc.on('error', reject);

    render(doc);

    doc.end();
  });
}

@Injectable({ deps: [DatabaseService, AppointmentsService, MedicalRecordsService] })
export class ReportsService {
  constructor(
    private db: DatabaseService,
    private appointmentsService: AppointmentsService,
    private medicalRecordsService: MedicalRecordsService
  ) {}

  async generateInvoice(appointmentId: string): Promise<GeneratedReport & { invoice: InvoiceDetails }> {
    const appointment = await this.appointmentsService.findById(appointmentId);
    if (!appointment) throw new NotFoundError('Appointment', appointmentId);

    const tax = Math.round(appointment.consultationFee * 0.05); // 5% GST-style tax, flat
    const invoice: InvoiceDetails = {
      appointmentId: appointment.appointmentId,
      patientName: appointment.patientName,
      doctorName: appointment.doctorName,
      department: appointment.department,
      consultationFee: appointment.consultationFee,
      tax,
      total: appointment.consultationFee + tax
    };

    const pdfBase64 = await renderPdfToBase64((doc) => {
      doc.fontSize(18).text('MediMCP Hospital — Invoice', { align: 'center' });
      doc.moveDown();
      doc.fontSize(11);
      doc.text(`Appointment ID: ${invoice.appointmentId}`);
      doc.text(`Patient: ${invoice.patientName}`);
      doc.text(`Doctor: ${invoice.doctorName} (${invoice.department})`);
      doc.moveDown();
      doc.text(`Consultation Fee: Rs. ${invoice.consultationFee}`);
      doc.text(`Tax (5%): Rs. ${invoice.tax}`);
      doc.font('Helvetica-Bold').text(`Total: Rs. ${invoice.total}`);
      doc.moveDown();
      doc.font('Helvetica').fontSize(9).text(`Generated: ${new Date().toISOString()}`, { align: 'right' });
    });

    const report: GeneratedReport = {
      reportId: `rpt-${String(reportCounter++).padStart(4, '0')}`,
      type: 'invoice',
      relatedId: appointment.appointmentId,
      patientName: appointment.patientName,
      fileName: `invoice-${appointment.appointmentId}.pdf`,
      pdfBase64,
      generatedAt: new Date().toISOString()
    };

    this.db.reports.push(report);
    return { ...report, invoice };
  }

  async generatePrescriptionPdf(noteId: string): Promise<GeneratedReport> {
    const note = await this.medicalRecordsService.findNoteById(noteId);
    if (!note) throw new NotFoundError('Consultation note', noteId);

    const pdfBase64 = await renderPdfToBase64((doc) => {
      doc.fontSize(18).text('MediMCP Hospital — Prescription', { align: 'center' });
      doc.moveDown();
      doc.fontSize(11);
      doc.text(`Patient: ${note.patientName}`);
      doc.text(`Doctor: ${note.doctorName} (${note.department})`);
      doc.text(`Date: ${note.createdAt.slice(0, 10)}`);
      doc.moveDown();
      doc.font('Helvetica-Bold').text('Diagnosis:');
      doc.font('Helvetica').text(note.diagnosis);
      doc.moveDown();
      doc.font('Helvetica-Bold').text('Notes:');
      doc.font('Helvetica').text(note.notes);
      doc.moveDown();
      doc.font('Helvetica-Bold').text('Prescribed Medicines:');
      doc.font('Helvetica');
      note.prescribedMedicines.forEach((m) => doc.text(`- ${m}`));
    });

    const report: GeneratedReport = {
      reportId: `rpt-${String(reportCounter++).padStart(4, '0')}`,
      type: 'prescription',
      relatedId: note.noteId,
      patientName: note.patientName,
      fileName: `prescription-${note.noteId}.pdf`,
      pdfBase64,
      generatedAt: new Date().toISOString()
    };

    this.db.reports.push(report);
    return report;
  }

  async getReport(reportId: string): Promise<GeneratedReport> {
    const report = this.db.reports.find((r) => r.reportId === reportId);
    if (!report) throw new NotFoundError('Report', reportId);
    return report;
  }
}