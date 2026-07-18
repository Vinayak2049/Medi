export type DoctorStatus = 'Available' | 'Busy' | 'In Surgery' | 'Offline' | 'On Leave';

export interface AppointmentSlot {
  time: string;
  occupied: boolean;
}

export interface DailyTimeBlock {
  day: string;
  ranges: string[];
}

export interface EducationEntry {
  degree: string;
  institution: string;
  year: number;
}

export interface Doctor {
  doctorId: string;
  fullName: string;
  profilePhoto: string;
  qualification: string;
  specialization: string;
  department: string;
  yearsOfExperience: number;
  languagesSpoken: string[];
  consultationFee: number;
  hospitalBranch: string;
  email: string;
  phone: string;
  status: DoctorStatus;
  currentlyAvailable: boolean;
  todaysSchedule: DailyTimeBlock;
  consultationTimings: DailyTimeBlock[];
  availableSlots: AppointmentSlot[];
  rating: number;
  biography: string;
  achievements: string[];
  education: EducationEntry[];
  certifications: string[];
}

export type AppointmentStatus = 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';

export interface Appointment {
  appointmentId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  department: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  consultationFee: number;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Medical Records & Reports (Member 3)
// ---------------------------------------------------------------------------

export interface ConsultationNote {
  noteId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  department: string;
  diagnosis: string;
  notes: string;
  prescribedMedicines: string[];
  createdAt: string;
}

export interface SharedNote {
  shareId: string;
  noteId: string;
  sharedByDoctorId: string;
  sharedWithDoctorId: string;
  sharedWithDoctorName: string;
  message: string;
  sharedAt: string;
}

export type LabReportStatus = 'Requested' | 'Completed';

export interface LabReportRequest {
  requestId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  testName: string;
  status: LabReportStatus;
  requestedAt: string;
  resultSummary?: string;
  completedAt?: string;
}

export interface PatientMedicalRecord {
  patientId: string;
  patientName: string;
  consultationNotes: ConsultationNote[];
  sharedNotes: SharedNote[];
  labReports: LabReportRequest[];
}

export type ReportType = 'invoice' | 'prescription';

export interface GeneratedReport {
  reportId: string;
  type: ReportType;
  relatedId: string;
  patientName: string;
  fileName: string;
  pdfBase64: string;
  generatedAt: string;
}

export interface InvoiceDetails {
  appointmentId: string;
  patientName: string;
  doctorName: string;
  department: string;
  consultationFee: number;
  tax: number;
  total: number;
}

// ---------------------------------------------------------------------------
// Pharmacy & Communication (Member 4)
// ---------------------------------------------------------------------------

export type MedicineCategory =
  | 'Analgesic'
  | 'Antibiotic'
  | 'Antidiabetic'
  | 'Antihypertensive'
  | 'Antihistamine'
  | 'Cardiac'
  | 'Gastrointestinal'
  | 'Supplement'
  | 'Respiratory'
  | 'Dermatological';

export interface Medicine {
  medicineId: string;
  name: string;
  category: MedicineCategory;
  manufacturer: string;
  unitPrice: number;
  stockQuantity: number;
  requiresPrescription: boolean;
  description: string;
}

export type PrescriptionStatus = 'Pending' | 'Dispensed';

export interface PharmacyPrescription {
  prescriptionId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  medicineId: string;
  medicineName: string;
  quantity: number;
  dosageInstructions: string;
  status: PrescriptionStatus;
  prescribedAt: string;
  dispensedAt?: string;
}

export type NotificationChannel = 'email' | 'sms';
export type NotificationType = 'appointment_confirmation' | 'reminder' | 'report_available';
export type NotificationStatus = 'Sent' | 'Failed';

export interface NotificationLog {
  notificationId: string;
  channel: NotificationChannel;
  recipient: string;
  subject: string;
  message: string;
  type: NotificationType;
  relatedId: string;
  status: NotificationStatus;
  sentAt: string;
}

// ---------------------------------------------------------------------------
// Patient Onboarding & Department Assignment (Member 1)
// ---------------------------------------------------------------------------

export type Gender = 'Male' | 'Female' | 'Other';

export interface Patient {
  patientId: string;
  fullName: string;
  age: number;
  gender: Gender;
  phone: string;
  email: string;
  address: string;
  bloodGroup: string;
  symptoms: string[];
  assignedDepartment: string | null;
  assignmentConfidence: 'High' | 'Medium' | 'Low' | null;
  registeredAt: string; // ISO timestamp
}

export interface DepartmentCatalogEntry {
  department: string;
  description: string;
  commonSymptoms: string[];
}

export interface DepartmentAssignmentResult {
  recommendedDepartment: string;
  confidence: 'High' | 'Medium' | 'Low';
  matchedSymptoms: string[];
  alternativeDepartments: string[];
}