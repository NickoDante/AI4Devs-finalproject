export interface Feedback {
  id: string;
  responseId: string; // Relación con Response
  userId: string; // Relación con User
  rating: number; // 1-5
  isHelpful: boolean;
  comment?: string;
  categories?: string[];
  tags?: string[];
  suggestedImprovements?: string;
  documentIds?: string[]; // Referencias a documentos
  createdAt: Date;
  updatedAt: Date;
} 