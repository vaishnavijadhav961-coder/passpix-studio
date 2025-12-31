export interface PassportStandard {
  country: string;
  widthMm: number;
  heightMm: number;
  label: string;
}

export type ProcessingStatus = 'idle' | 'processing' | 'success' | 'error';

export interface AppState {
  step: 'upload' | 'edit' | 'print';
  originalImage: string | null; // Base64
  currentImage: string | null; // Base64 (edited)
  history: string[]; // Undo stack
  historyIndex: number;
  standard: PassportStandard;
  processingStatus: ProcessingStatus;
  processingMessage: string;
}

export type CostumeType = 'student' | 'corporate' | 'government' | 'doctor' | 'engineer' | 'lawyer' | 'police';

export interface FilterSettings {
  brightness: number;
  contrast: number;
  saturation: number;
  warmth: number;
}
