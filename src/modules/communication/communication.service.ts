import { Injectable } from '@nitrostack/core';
import { DatabaseService } from '../../common/database.service.js';
import { AppointmentsService, NotFoundError } from '../appointments/appointments.service.js';
import { ReportsService } from '../reports/reports.service.js';
import type { NotificationLog, NotificationChannel } from '../../common/types.js';

export { NotFoundError };

let notificationCounter = 1;

/**
 * No real email/SMS provider is wired up (out of scope for this phase) —
 * every "send" here is simulated: it validates the related record exists,
 * builds a message, and logs it to db.notificationLogs so the pharmacy/
 * comms flow is fully testable end-to-end without external services.
 */
@Injectable({ deps: [DatabaseService, AppointmentsService, ReportsService] })
export class CommunicationService {
  constructor(
    private db: DatabaseService,
    private appointmentsService: AppointmentsService,
    private reportsService: ReportsService
  ) {}

  private log(params: {
    channel: NotificationChannel;
    recipient: string;
    subject: string;
    message: string;
    type: NotificationLog['type'];
    relatedId: string;
  }): NotificationLog {
    const entry: NotificationLog = {
      notificationId: `ntf-${String(notificationCounter++).padStart(4, '0')}`,
      channel: params.channel,
      recipient: params.recipient,
      subject: params.subject,
      message: params.message,
      type: params.type,
      relatedId: params.relatedId,
      status: 'Sent',
      sentAt: new Date().toISOString()
    };
    this.db.notificationLogs.push(entry);
    return entry;
  }

  async sendAppointmentConfirmation(params: { appointmentId: string; channel: NotificationChannel; recipient: string }) {
    const appointment = await this.appointmentsService.findById(params.appointmentId);
    if (!appointment) throw new NotFoundError('Appointment', params.appointmentId);

    return this.log({
      channel: params.channel,
      recipient: params.recipient,
      subject: 'Appointment Confirmed',
      message: `Hi ${appointment.patientName}, your appointment with ${appointment.doctorName} (${appointment.department}) is confirmed for ${appointment.date} at ${appointment.time}.`,
      type: 'appointment_confirmation',
      relatedId: appointment.appointmentId
    });
  }

  async sendReminder(params: { appointmentId: string; channel: NotificationChannel; recipient: string }) {
    const appointment = await this.appointmentsService.findById(params.appointmentId);
    if (!appointment) throw new NotFoundError('Appointment', params.appointmentId);

    return this.log({
      channel: params.channel,
      recipient: params.recipient,
      subject: 'Appointment Reminder',
      message: `Reminder: ${appointment.patientName}, you have an appointment with ${appointment.doctorName} on ${appointment.date} at ${appointment.time}.`,
      type: 'reminder',
      relatedId: appointment.appointmentId
    });
  }

  async notifyReportAvailable(params: { reportId: string; channel: NotificationChannel; recipient: string }) {
    const report = await this.reportsService.getReport(params.reportId);

    return this.log({
      channel: params.channel,
      recipient: params.recipient,
      subject: `Your ${report.type} is ready`,
      message: `Hi ${report.patientName}, your ${report.type} (${report.fileName}) is ready to download.`,
      type: 'report_available',
      relatedId: report.reportId
    });
  }
}