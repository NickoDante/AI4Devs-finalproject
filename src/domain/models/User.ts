import { ObjectId } from 'mongodb';

export type UserRole = 'admin' | 'user' | 'guest';

export interface UserMetadata {
    slackTeamId?: string;
    lastActive?: Date;
    isBot?: boolean;
    preferences?: {
        language: 'es' | 'en';
        notifications: boolean;
        timezone: string;
    };
    [key: string]: any;
}

export interface User {
    _id?: ObjectId;
    userId: string;  // ID de Slack
    username: string;
    email: string;
    realName: string;
    role: string;
    isAdmin: boolean;
    language: string;
    permissions: string[];
    isActive: boolean;
    metadata?: UserMetadata;
    createdAt: Date;
    updatedAt: Date;
} 