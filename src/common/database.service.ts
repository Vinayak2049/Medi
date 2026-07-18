import { Injectable } from '@nitrostack/core';
import type {
  Doctor,
  Appointment,
  ConsultationNote,
  SharedNote,
  LabReportRequest,
  GeneratedReport,
  Medicine,
  PharmacyPrescription,
  NotificationLog,
  Patient
} from './types.js';

@Injectable()
export class DatabaseService {
  doctors: Doctor[] = [
    {
      doctorId: 'doc-001',
      fullName: 'Dr. Anjali Menon',
      profilePhoto: 'https://images.medimcp.dev/doctors/doc-001.jpg',
      qualification: 'MBBS, MD (Cardiology), DM (Cardiology)',
      specialization: 'Interventional Cardiologist',
      department: 'Cardiology',
      yearsOfExperience: 18,
      languagesSpoken: ['English', 'Malayalam', 'Hindi'],
      consultationFee: 900,
      hospitalBranch: 'Kochi Main Campus',
      email: 'anjali.menon@medimcp.example',
      phone: '+91 484 555 0101',
      status: 'Available',
      currentlyAvailable: true,
      todaysSchedule: { day: 'Monday', ranges: ['09:00-12:00', '14:00-17:00'] },
      consultationTimings: [{ day: 'Monday', ranges: ['09:00-12:00', '14:00-17:00'] }],
      availableSlots: [
        { time: '9:00 AM', occupied: false },
        { time: '9:30 AM', occupied: true },
        { time: '10:00 AM', occupied: false },
        { time: '10:30 AM', occupied: false }
      ],
      rating: 4.8,
      biography: 'Specializes in complex coronary interventions and preventive cardiology.',
      achievements: ['3,000+ angioplasties', 'Best Interventional Cardiologist, Kerala Medical Awards 2023'],
      education: [{ degree: 'DM (Cardiology)', institution: 'AIIMS Delhi', year: 2012 }],
      certifications: ['Fellow, Society of Cardiovascular Angiography']
    },
    {
      doctorId: 'doc-002',
      fullName: 'Dr. Ravi Varma Thampi',
      profilePhoto: 'https://images.medimcp.dev/doctors/doc-002.jpg',
      qualification: 'MBBS, MD (General Medicine), DM (Neurology)',
      specialization: 'Neurologist',
      department: 'Neurology',
      yearsOfExperience: 14,
      languagesSpoken: ['English', 'Malayalam'],
      consultationFee: 850,
      hospitalBranch: 'Kochi Main Campus',
      email: 'ravi.thampi@medimcp.example',
      phone: '+91 484 555 0102',
      status: 'In Surgery',
      currentlyAvailable: false,
      todaysSchedule: { day: 'Monday', ranges: ['10:00-13:00'] },
      consultationTimings: [{ day: 'Monday', ranges: ['10:00-13:00'] }],
      availableSlots: [
        { time: '10:00 AM', occupied: true },
        { time: '10:30 AM', occupied: true },
        { time: '11:00 AM', occupied: false },
        { time: '11:30 AM', occupied: false }
      ],
      rating: 4.6,
      biography: "Treats stroke, epilepsy, and movement disorders; leads the hospital's acute stroke response protocol.",
      achievements: ['Set up the 24x7 Stroke Code unit at Kochi Main Campus'],
      education: [{ degree: 'DM (Neurology)', institution: 'NIMHANS Bengaluru', year: 2015 }],
      certifications: ['Certified Stroke Specialist, World Stroke Organization']
    },
    {
      doctorId: 'doc-003',
      fullName: 'Dr. Priya Nair',
      profilePhoto: 'https://images.medimcp.dev/doctors/doc-003.jpg',
      qualification: 'MBBS, MS (Orthopedics)',
      specialization: 'Joint Replacement Surgeon',
      department: 'Orthopedics',
      yearsOfExperience: 11,
      languagesSpoken: ['English', 'Malayalam', 'Tamil'],
      consultationFee: 700,
      hospitalBranch: 'Kochi Main Campus',
      email: 'priya.nair@medimcp.example',
      phone: '+91 484 555 0103',
      status: 'Available',
      currentlyAvailable: true,
      todaysSchedule: { day: 'Monday', ranges: ['09:00-13:00'] },
      consultationTimings: [{ day: 'Monday', ranges: ['09:00-13:00'] }],
      availableSlots: [
        { time: '9:00 AM', occupied: false },
        { time: '9:30 AM', occupied: false },
        { time: '10:00 AM', occupied: true },
        { time: '10:30 AM', occupied: false }
      ],
      rating: 4.7,
      biography: 'Focuses on minimally invasive knee and hip replacement; runs a weekend sports injury clinic.',
      achievements: ['500+ successful joint replacement surgeries'],
      education: [{ degree: 'MS (Orthopedics)', institution: 'CMC Vellore', year: 2015 }],
      certifications: ['Fellowship in Joint Replacement, Singapore General Hospital']
    }
    // ...add your remaining doctors here in this same shape (up to 20 total)
  ];

  appointments: Appointment[] = [];

  // Medical Records & Reports (Member 3)
  consultationNotes: ConsultationNote[] = [];
  sharedNotes: SharedNote[] = [];
  labReportRequests: LabReportRequest[] = [];
  reports: GeneratedReport[] = [];

  // Pharmacy & Communication (Member 4)
  medicines: Medicine[] = [
    {
      medicineId: 'med-001',
      name: 'Paracetamol 500mg',
      category: 'Analgesic',
      manufacturer: 'Cipla',
      unitPrice: 20,
      stockQuantity: 500,
      requiresPrescription: false,
      description: 'For fever and mild to moderate pain relief.'
    },
    {
      medicineId: 'med-002',
      name: 'Amoxicillin 500mg',
      category: 'Antibiotic',
      manufacturer: 'Sun Pharma',
      unitPrice: 85,
      stockQuantity: 120,
      requiresPrescription: true,
      description: 'Broad-spectrum antibiotic for bacterial infections.'
    },
    {
      medicineId: 'med-003',
      name: 'Metformin 500mg',
      category: 'Antidiabetic',
      manufacturer: "Dr. Reddy's",
      unitPrice: 45,
      stockQuantity: 8,
      requiresPrescription: true,
      description: 'First-line medication for type 2 diabetes management.'
    },
    {
      medicineId: 'med-004',
      name: 'Amlodipine 5mg',
      category: 'Antihypertensive',
      manufacturer: 'Cipla',
      unitPrice: 30,
      stockQuantity: 200,
      requiresPrescription: true,
      description: 'Calcium channel blocker for high blood pressure.'
    },
    {
      medicineId: 'med-005',
      name: 'Cetirizine 10mg',
      category: 'Antihistamine',
      manufacturer: 'Glenmark',
      unitPrice: 15,
      stockQuantity: 0,
      requiresPrescription: false,
      description: 'Relieves allergy symptoms such as sneezing and itching.'
    },
    {
      medicineId: 'med-006',
      name: 'Atorvastatin 20mg',
      category: 'Cardiac',
      manufacturer: 'Sun Pharma',
      unitPrice: 60,
      stockQuantity: 150,
      requiresPrescription: true,
      description: 'Statin used to lower cholesterol and reduce cardiac risk.'
    },
    {
      medicineId: 'med-007',
      name: 'Pantoprazole 40mg',
      category: 'Gastrointestinal',
      manufacturer: "Dr. Reddy's",
      unitPrice: 35,
      stockQuantity: 300,
      requiresPrescription: false,
      description: 'Proton pump inhibitor for acidity and reflux.'
    },
    {
      medicineId: 'med-008',
      name: 'Vitamin D3 60K',
      category: 'Supplement',
      manufacturer: 'Mankind Pharma',
      unitPrice: 32,
      stockQuantity: 400,
      requiresPrescription: false,
      description: 'Weekly vitamin D3 supplement for deficiency correction.'
    },
    {
      medicineId: 'med-009',
      name: 'Salbutamol Inhaler',
      category: 'Respiratory',
      manufacturer: 'Cipla',
      unitPrice: 120,
      stockQuantity: 25,
      requiresPrescription: true,
      description: 'Bronchodilator inhaler for asthma and COPD relief.'
    },
    {
      medicineId: 'med-010',
      name: 'Clobetasol Cream',
      category: 'Dermatological',
      manufacturer: 'Glenmark',
      unitPrice: 55,
      stockQuantity: 60,
      requiresPrescription: true,
      description: 'Topical corticosteroid for severe skin inflammation.'
    }
  ];

  pharmacyPrescriptions: PharmacyPrescription[] = [];
  notificationLogs: NotificationLog[] = [];

  // Patient Onboarding & Department Assignment (Member 1)
  patients: Patient[] = [
    {
      patientId: 'pat-001',
      fullName: 'Ravi Kumar',
      age: 45,
      gender: 'Male',
      phone: '+91 98765 43210',
      email: 'ravi.kumar@example.com',
      address: 'Panampilly Nagar, Kochi',
      bloodGroup: 'O+',
      symptoms: ['chest pain', 'shortness of breath'],
      assignedDepartment: 'Cardiology',
      assignmentConfidence: 'High',
      registeredAt: '2026-07-10T08:30:00.000Z'
    },
    {
      patientId: 'pat-002',
      fullName: 'Meera Suresh',
      age: 8,
      gender: 'Female',
      phone: '+91 98765 11122',
      email: 'meera.parent@example.com',
      address: 'Edappally, Kochi',
      bloodGroup: 'B+',
      symptoms: ['fever', 'cough'],
      assignedDepartment: 'Pediatrics',
      assignmentConfidence: 'High',
      registeredAt: '2026-07-14T11:00:00.000Z'
    }
  ];
}