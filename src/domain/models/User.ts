export interface User {
  id: string;
  slackId: string;
  displayName: string;
  isAdmin: boolean;
  language: 'es' | 'en';
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
} 