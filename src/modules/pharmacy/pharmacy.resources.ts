import { ResourceDecorator as Resource, Widget, ExecutionContext } from '@nitrostack/core';
import { PharmacyService } from './pharmacy.service.js';

export class PharmacyResources {
  constructor(private pharmacyService: PharmacyService) {}

  @Resource({
    uri: 'pharmacy://inventory',
    name: 'Pharmacy Inventory',
    description: 'Full medicine inventory with stock levels and pricing',
    mimeType: 'application/json',
    examples: {
      response: { medicines: [{ medicineId: 'med-001', name: 'Paracetamol 500mg', stockQuantity: 500 }] }
    }
  })
  @Widget('pharmacy-inventory')
  async getInventory(uri: string) {
    const { medicines } = await this.pharmacyService.list({ page: 1, limit: 50 });
    return { type: 'json' as const, data: { medicines } };
  }
}