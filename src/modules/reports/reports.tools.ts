import { ToolDecorator as Tool, Widget, Cache, ExecutionContext } from '@nitrostack/core';
import { z } from 'zod';
import { ReportsService, NotFoundError } from './reports.service.js';

const GenerateInvoiceInput = z.object({
  appointmentId: z.string().min(1)
});

const GeneratePrescriptionPdfInput = z.object({
  noteId: z.string().min(1)
});

const GetReportInput = z.object({
  reportId: z.string().min(1)
});

export class ReportsTools {
  constructor(private reportsService: ReportsService) {}

  @Tool({
    name: 'generate_invoice',
    description: 'Generate a PDF invoice for a completed/confirmed appointment',
    inputSchema: GenerateInvoiceInput,
    examples: {
      request: { appointmentId: 'apt-0001' },
      response: { reportId: 'rpt-0001', fileName: 'invoice-apt-0001.pdf', invoice: { total: 945 } }
    }
  })
  async generateInvoice(input: any, ctx: ExecutionContext) {
    try {
      return await this.reportsService.generateInvoice(input.appointmentId);
    } catch (err) {
      ctx.logger.warn('generateInvoice failed', { input, error: (err as Error).message });
      throw err;
    }
  }

  @Tool({
    name: 'generate_prescription_pdf',
    description: 'Generate a PDF prescription from a consultation note',
    inputSchema: GeneratePrescriptionPdfInput,
    examples: {
      request: { noteId: 'note-0001' },
      response: { reportId: 'rpt-0002', fileName: 'prescription-note-0001.pdf' }
    }
  })
  async generatePrescriptionPdf(input: any, ctx: ExecutionContext) {
    try {
      return await this.reportsService.generatePrescriptionPdf(input.noteId);
    } catch (err) {
      ctx.logger.warn('generatePrescriptionPdf failed', { input, error: (err as Error).message });
      throw err;
    }
  }

  @Tool({
    name: 'get_report',
    description: 'Retrieve a previously generated report (invoice or prescription) by report ID',
    inputSchema: GetReportInput,
    examples: {
      request: { reportId: 'rpt-0001' },
      response: { reportId: 'rpt-0001', type: 'invoice', fileName: 'invoice-apt-0001.pdf' }
    }
  })
  async getReport(input: any, ctx: ExecutionContext) {
    try {
      return await this.reportsService.getReport(input.reportId);
    } catch (err) {
      ctx.logger.warn('getReport failed', { input, error: (err as Error).message });
      throw err;
    }
  }
}