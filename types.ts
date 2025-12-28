
export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  diagnosedDate?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  ckdStage?: '1' | '2' | '3a' | '3b' | '4' | '5' | 'unknown';
  targetBloodPressure?: string;
  baselineWeight?: number;
}

export interface VitalRecord {
  id: string;
  timestamp: string;
  bloodPressureSys: number;
  bloodPressureDia: number;
  weight: number;
  urineProtein: 'negative' | 'trace' | '1+' | '2+' | '3+' | '4+';
  edemaLevel: 0 | 1 | 2 | 3;
  creatinine?: number;
  uricAcid?: number;
  eGFR?: number;
  symptoms?: string[];
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  reminders: string[];
  lastTaken?: string;
  sourcePrescriptionId?: string; // 关联处方来源
}

export interface Prescription {
  id: string;
  date: string;
  type: 'chinese' | 'western' | 'integrated';
  fileName: string;
  fileData: string; // Base64
  mimeType: string;
  extractedMeds: Medication[];
  note?: string;
}

export interface Meal {
  id: string;
  timestamp: string;
  description: string;
  proteinG: number;
  sodiumMg: number;
  potassiumMg: number;
  calories: number;
}

export interface AppState {
  user: User | null;
  vitals: VitalRecord[];
  medications: Medication[];
  meals: Meal[];
  prescriptions: Prescription[]; // 新增处方档案
}
