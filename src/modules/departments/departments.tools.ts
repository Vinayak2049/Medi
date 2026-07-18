import { ToolDecorator as Tool, Widget, Cache, ExecutionContext } from '@nitrostack/core';
import { z } from 'zod';
import { DepartmentsService } from './departments.service.js';

const AssignDepartmentInput = z.object({
  symptoms: z.array(z.string().min(1)).min(1).describe('Reported symptoms, e.g. ["chest pain", "shortness of breath"]'),
  patientId: z
    .string()
    .optional()
    .describe('If provided, the recommended department is saved onto this patient record')
});

export class DepartmentsTools {
  constructor(private departmentsService: DepartmentsService) {}

  @Tool({
    name: 'assign_department',
    description:
      'Recommend the best hospital department for a set of reported symptoms, and optionally save the recommendation onto a patient record',
    inputSchema: AssignDepartmentInput,
    examples: {
      request: { symptoms: ['chest pain', 'shortness of breath'], patientId: 'pat-001' },
      response: { recommendedDepartment: 'Cardiology', confidence: 'High', alternativeDepartments: ['Pulmonology'] }
    }
  })
  async assignDepartment(input: any, ctx: ExecutionContext) {
    ctx.logger.info('Assigning department', { symptoms: input.symptoms, patientId: input.patientId });
    return this.departmentsService.assign(input.symptoms, input.patientId);
  }
}