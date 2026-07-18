import { Injectable } from '@nitrostack/core';
import { DatabaseService } from '../../common/database.service.js';
import { DoctorsService, NotFoundError } from '../doctors/doctors.service.js';
import type { Medicine, MedicineCategory, PharmacyPrescription } from '../../common/types.js';

export { NotFoundError };

export class OutOfStockError extends Error {
  constructor(medicineName: string, available: number, requested: number) {
    super(`"${medicineName}" has only ${available} in stock, but ${requested} were requested`);
    this.name = 'OutOfStockError';
  }
}

let prescriptionCounter = 1;

export interface ListMedicinesOptions {
  page: number;
  limit: number;
  search?: string;
  category?: MedicineCategory;
  inStockOnly?: boolean;
}

@Injectable({ deps: [DatabaseService, DoctorsService] })
export class PharmacyService {
  constructor(private db: DatabaseService, private doctorsService: DoctorsService) {}

  private paginate(list: Medicine[], page: number, limit: number) {
    const total = list.length;
    const pages = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;
    return {
      medicines: list.slice(start, start + limit),
      pagination: { page, limit, total, pages }
    };
  }

  async list(options: ListMedicinesOptions) {
    let result = this.db.medicines;

    if (options.category) {
      result = result.filter((m) => m.category === options.category);
    }
    if (options.inStockOnly) {
      result = result.filter((m) => m.stockQuantity > 0);
    }
    if (options.search) {
      const q = options.search.toLowerCase();
      result = result.filter(
        (m) => m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q) || m.manufacturer.toLowerCase().includes(q)
      );
    }

    const sorted = [...result].sort((a, b) => a.name.localeCompare(b.name));
    return this.paginate(sorted, options.page, options.limit);
  }

  async findById(medicineId: string): Promise<Medicine | undefined> {
    return this.db.medicines.find((m) => m.medicineId === medicineId);
  }

  async prescribe(params: {
    patientId: string;
    patientName: string;
    doctorId: string;
    medicineId: string;
    quantity: number;
    dosageInstructions: string;
  }): Promise<PharmacyPrescription> {
    const doctor = await this.doctorsService.findById(params.doctorId);
    if (!doctor) throw new NotFoundError('Doctor', params.doctorId);

    const medicine = await this.findById(params.medicineId);
    if (!medicine) throw new NotFoundError('Medicine', params.medicineId);

    if (medicine.stockQuantity < params.quantity) {
      throw new OutOfStockError(medicine.name, medicine.stockQuantity, params.quantity);
    }

    medicine.stockQuantity -= params.quantity;

    const prescription: PharmacyPrescription = {
      prescriptionId: `pmed-${String(prescriptionCounter++).padStart(4, '0')}`,
      patientId: params.patientId,
      patientName: params.patientName,
      doctorId: doctor.doctorId,
      doctorName: doctor.fullName,
      medicineId: medicine.medicineId,
      medicineName: medicine.name,
      quantity: params.quantity,
      dosageInstructions: params.dosageInstructions,
      status: 'Pending',
      prescribedAt: new Date().toISOString()
    };

    this.db.pharmacyPrescriptions.push(prescription);
    return prescription;
  }
}