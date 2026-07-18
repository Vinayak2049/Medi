import { ToolDecorator as Tool, Widget, Cache, ExecutionContext } from '@nitrostack/core';
import { z } from 'zod';
import { CommunicationService, NotFoundError } from './communication.service.js';

const ChannelEnum = z.enum(['email', 'sms']);

const SendAppointmentConfirmationInput = z.object({
  appointmentId: z.string().min(1),
  channel: ChannelEnum.default('email'),
  recipient: z.string().min(1).describe('Email address or phone number depending on channel')
});

const SendReminderInput = z.object({
  appointmentId: z.string().min(1),
  channel: ChannelEnum.default('sms'),
  recipient: z.string().min(1)
});

const NotifyReportAvailableInput = z.object({
  reportId: z.string().min(1),
  channel: ChannelEnum.default('email'),
  recipient: z.string().min(1)
});

export class CommunicationTools {
  constructor(private communicationService: CommunicationService) {}

  @Tool({
    name: 'send_appointment_confirmation',
    description: 'Send an appointment confirmation notification to a patient (simulated — logs a notification record)',
    inputSchema: SendAppointmentConfirmationInput,
    examples: {
      request: { appointmentId: 'apt-0001', channel: 'email', recipient: 'ravi.kumar@example.com' },
      response: { notificationId: 'ntf-0001', status: 'Sent', channel: 'email' }
    }
  })
  async sendAppointmentConfirmation(input: any, ctx: ExecutionContext) {
    try {
      return await this.communicationService.sendAppointmentConfirmation(input);
    } catch (err) {
      ctx.logger.warn('sendAppointmentConfirmation failed', { input, error: (err as Error).message });
      throw err;
    }
  }

  @Tool({
    name: 'send_reminder',
    description: 'Send an appointment reminder notification to a patient (simulated — logs a notification record)',
    inputSchema: SendReminderInput,
    examples: {
      request: { appointmentId: 'apt-0001', channel: 'sms', recipient: '+91 98765 43210' },
      response: { notificationId: 'ntf-0002', status: 'Sent', channel: 'sms' }
    }
  })
  async sendReminder(input: any, ctx: ExecutionContext) {
    try {
      return await this.communicationService.sendReminder(input);
    } catch (err) {
      ctx.logger.warn('sendReminder failed', { input, error: (err as Error).message });
      throw err;
    }
  }

  @Tool({
    name: 'notify_report_available',
    description: 'Notify a patient that a generated report (invoice/prescription) is ready (simulated — logs a notification record)',
    inputSchema: NotifyReportAvailableInput,
    examples: {
      request: { reportId: 'rpt-0001', channel: 'email', recipient: 'ravi.kumar@example.com' },
      response: { notificationId: 'ntf-0003', status: 'Sent', channel: 'email' }
    }
  })
  async notifyReportAvailable(input: any, ctx: ExecutionContext) {
    try {
      return await this.communicationService.notifyReportAvailable(input);
    } catch (err) {
      ctx.logger.warn('notifyReportAvailable failed', { input, error: (err as Error).message });
      throw err;
    }
  }
}