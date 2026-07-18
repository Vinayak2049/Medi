import { ToolDecorator as Tool, Widget, Cache, ExecutionContext } from '@nitrostack/core';
import { z } from 'zod';
import { PharmacyService, NotFoundError, OutOfStockError } from './pharmacy.service.js';

const MedicineCategoryEnum = z.enum([
  'Analgesic',
  'Antibiotic',
  'Antidiabetic',
  'Antihypertensive',
  'Antihistamine',
  'Cardiac',
  'Gastrointestinal',
  'Supplement',
  'Respiratory',
  'Dermatological'
]);

const ListMedicinesInput = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
  search: z.string().optional().describe('Search by name, category, or manufacturer'),
  category: MedicineCategoryEnum.optional(),
  inStockOnly: z.boolean().default(false)
});

const PrescribeMedicineInput = z.object({
  patientId: z.string().min(1),
  patientName: z.string().min(1),
  doctorId: z.string().min(1),
  medicineId: z.string().min(1),
  quantity: z.number().int().min(1),
  dosageInstructions: z.string().min(1).describe('e.g. "1 tablet twice daily after food for 5 days"')
});

export class PharmacyTools {
  constructor(private pharmacyService: PharmacyService) {}

  @Tool({
    name: 'list_medicines',
    description: 'List/search pharmacy medicines with pagination, category filter, and in-stock filter',
    inputSchema: ListMedicinesInput,
    examples: {
      request: { page: 1, limit: 20, category: 'Antibiotic' },
      response: {
        medicines: [{ medicineId: 'med-002', name: 'Amoxicillin 500mg', stockQuantity: 120 }],
        pagination: { page: 1, limit: 20, total: 1, pages: 1 }
      }
    }
  })
  @Widget('pharmacy-inventory')
  @Cache({ ttl: 20, key: (i: any) => `list_medicines:${i.page}:${i.limit}:${i.search}:${i.category}:${i.inStockOnly}` })
  async listMedicines(input: any, ctx: ExecutionContext) {
    ctx.logger.info('Listing medicines', { input });
    return this.pharmacyService.list(input);
  }

  @Tool({
    name: 'prescribe_medicine',
    description: 'Prescribe a medicine to a patient, decrementing pharmacy stock',
    inputSchema: PrescribeMedicineInput,
    examples: {
      request: {
        patientId: 'pat-001',
        patientName: 'Ravi Kumar',
        doctorId: 'doc-001',
        medicineId: 'med-004',
        quantity: 10,
        dosageInstructions: '1 tablet once daily in the morning'
      },
      response: { prescriptionId: 'pmed-0001', status: 'Pending', medicineName: 'Amlodipine 5mg' }
    }
  })
  async prescribeMedicine(input: any, ctx: ExecutionContext) {
    try {
      return await this.pharmacyService.prescribe(input);
    } catch (err) {
      ctx.logger.warn('prescribeMedicine failed', { input, error: (err as Error).message });
      throw err;
    }
  }
}