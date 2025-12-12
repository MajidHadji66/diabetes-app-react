
export interface GlucoseReading {
  id: string;
  value: number; // in mg/dL
  timestamp: Date;
}

export enum MealType {
  Breakfast = 'Breakfast',
  Lunch = 'Lunch',
  Dinner = 'Dinner',
  Snack = 'Snack',
}

export interface Meal {
  id: string;
  name: string;
  carbs: number; // in grams
  type: MealType;
  timestamp: Date;
  photoUrl?: string;
}

export interface Exercise {
  id: string;
  type: string;
  duration: number; // in minutes
  timestamp: Date;
}

export enum JournalTag {
  GoodControl = 'Good Control',
  Learning = 'Learning',
  SlipUp = 'Slip-Up',
  FeelingGreat = 'Feeling Great',
  Stressed = 'Stressed',
}

export interface JournalEntry {
  id: string;
  notes: string;
  mood: number; // 1-5 scale
  tag?: JournalTag;
  timestamp: Date;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  time: string; // HH:MM format
  reminderEnabled: boolean;
}

export interface Settings {
  theme: 'light' | 'dark';
  glucoseTargetRange: {
    min: number;
    max: number;
  };
  glucoseAlertLevels: {
    low: number;
    high: number;
  };
  dexcom?: {
    connected: boolean;
    region: 'US' | 'OUS';
    lastSync?: Date;
    username?: string;
    accountId?: string;
  };
}

export interface AppState {
  glucoseReadings: GlucoseReading[];
  meals: Meal[];
  exercises: Exercise[];
  journalEntries: JournalEntry[];
  medications: Medication[];
  settings: Settings;
}

export type Action =
  | { type: 'ADD_MEAL'; payload: Meal }
  | { type: 'ADD_EXERCISE'; payload: Exercise }
  | { type: 'ADD_JOURNAL_ENTRY'; payload: JournalEntry }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<Settings> }
  | { type: 'ADD_MEDICATION'; payload: Medication }
  | { type: 'REMOVE_MEDICATION'; payload: { id: string } }
  | { type: 'TOGGLE_MEDICATION_REMINDER'; payload: { id: string } }
  | { type: 'IMPORT_DATA'; payload: { glucoseReadings: GlucoseReading[]; meals: Meal[]; exercises: Exercise[] } }
  | { type: 'REPLACE_GLUCOSE_READINGS'; payload: GlucoseReading[] };
