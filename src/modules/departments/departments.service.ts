import { Injectable } from '@nitrostack/core';
import { PatientsService } from '../patients/patients.service.js';
import type { DepartmentCatalogEntry, DepartmentAssignmentResult } from '../../common/types.js';

const CATALOG: DepartmentCatalogEntry[] = [
  { department: 'Cardiology', description: 'Heart and cardiovascular conditions', commonSymptoms: ['chest pain', 'shortness of breath', 'palpitations', 'high blood pressure', 'fainting'] },
  { department: 'Neurology', description: 'Brain, spine, and nervous system disorders', commonSymptoms: ['headache', 'seizure', 'numbness', 'dizziness', 'memory loss', 'weakness on one side'] },
  { department: 'Orthopedics', description: 'Bones, joints, and musculoskeletal injuries', commonSymptoms: ['joint pain', 'back pain', 'fracture', 'swelling in joints', 'difficulty walking'] },
  { department: 'ENT', description: 'Ear, nose, and throat conditions', commonSymptoms: ['sore throat', 'ear pain', 'hearing loss', 'sinus congestion', 'nosebleed'] },
  { department: 'Dermatology', description: 'Skin, hair, and nail conditions', commonSymptoms: ['rash', 'itching', 'acne', 'skin discoloration', 'hair loss'] },
  { department: 'General Medicine', description: 'General adult health concerns and chronic condition management', commonSymptoms: ['fever', 'fatigue', 'diabetes', 'weight loss', 'general weakness'] },
  { department: 'Gynecology', description: "Women's reproductive health", commonSymptoms: ['pregnancy', 'irregular periods', 'pelvic pain', 'menstrual cramps'] },
  { department: 'Pediatrics', description: 'Health of infants, children, and adolescents', commonSymptoms: ['fever', 'cough', 'vomiting in child', 'growth concerns', 'vaccination'] },
  { department: 'Psychiatry', description: 'Mental health and emotional wellbeing', commonSymptoms: ['anxiety', 'depression', 'insomnia', 'mood swings', 'panic attacks'] },
  { department: 'Radiology', description: 'Diagnostic imaging services', commonSymptoms: ['requires mri', 'requires ct scan', 'requires x-ray', 'imaging referral'] },
  { department: 'Emergency Medicine', description: 'Acute, life-threatening, or urgent conditions', commonSymptoms: ['severe bleeding', 'unconscious', 'severe trauma', 'difficulty breathing', 'accident'] },
  { department: 'Nephrology', description: 'Kidney health and dialysis', commonSymptoms: ['kidney pain', 'reduced urination', 'swelling in legs', 'blood in urine'] },
  { department: 'Pulmonology', description: 'Lungs and respiratory conditions', commonSymptoms: ['cough', 'wheezing', 'breathlessness', 'asthma', 'chest congestion'] },
  { department: 'Gastroenterology', description: 'Digestive system and liver conditions', commonSymptoms: ['stomach pain', 'nausea', 'acidity', 'diarrhea', 'constipation', 'jaundice'] },
  { department: 'Ophthalmology', description: 'Eye health and vision', commonSymptoms: ['blurred vision', 'eye pain', 'redness in eye', 'vision loss'] }
];

@Injectable({ deps: [PatientsService] })
export class DepartmentsService {
  constructor(private patientsService: PatientsService) {}

  async listCatalog(): Promise<DepartmentCatalogEntry[]> {
    return CATALOG;
  }

  /**
   * Simple keyword-overlap matcher: scores every department by how many of
   * its commonSymptoms appear (as substrings) in the patient's reported
   * symptoms, then returns the top match plus runner-ups.
   */
  async assign(symptoms: string[], patientId?: string): Promise<DepartmentAssignmentResult> {
    const normalizedSymptoms = symptoms.map((s) => s.toLowerCase().trim());

    const scored = CATALOG.map((entry) => {
      const matched = entry.commonSymptoms.filter((keyword) =>
        normalizedSymptoms.some((s) => s.includes(keyword) || keyword.includes(s))
      );
      return { department: entry.department, matched };
    })
      .filter((s) => s.matched.length > 0)
      .sort((a, b) => b.matched.length - a.matched.length);

    if (scored.length === 0) {
      const fallback: DepartmentAssignmentResult = {
        recommendedDepartment: 'General Medicine',
        confidence: 'Low',
        matchedSymptoms: [],
        alternativeDepartments: []
      };
      if (patientId) await this.patientsService.assignDepartment(patientId, fallback.recommendedDepartment, fallback.confidence);
      return fallback;
    }

    const top = scored[0];
    const confidence: 'High' | 'Medium' | 'Low' = top.matched.length >= 2 ? 'High' : 'Medium';

    const result: DepartmentAssignmentResult = {
      recommendedDepartment: top.department,
      confidence,
      matchedSymptoms: top.matched,
      alternativeDepartments: scored.slice(1, 3).map((s) => s.department)
    };

    if (patientId) {
      await this.patientsService.assignDepartment(patientId, result.recommendedDepartment, result.confidence);
    }

    return result;
  }
}