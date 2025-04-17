export interface User {
  id: string;
  username: string;
  email?: string;
  fullName?: string;
  role?: 'user' | 'admin';
  preferences?: {
    language?: string;
    notifications?: boolean;
    timezone?: string;
  };
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
} 