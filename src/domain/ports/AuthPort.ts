import { User } from '../models/User';

export interface AuthTokenInfo {
    userId: string;
    teamId: string;
    scopes: string[];
    isValid: boolean;
    expiresAt?: Date;
}

export interface AuthenticationResult {
    isAuthenticated: boolean;
    user?: User;
    error?: string;
}

export interface SlackAuthPayload {
    userId: string;
    timestamp: string;
    token: string;
}

export interface AuthResult {
    success: boolean;
    user?: User;
    error?: string;
}

export interface AuthPort {
    /**
     * Verifica si un token es válido y obtiene la información asociada
     */
    validateToken(token: string): Promise<boolean>;

    /**
     * Verifica si un usuario tiene un permiso específico
     */
    hasPermission(userId: string, permission: string): Promise<boolean>;

    /**
     * Obtiene la información completa del usuario
     */
    getUserInfo(userId: string): Promise<User | null>;

    /**
     * Verifica si un usuario está autenticado y tiene acceso
     */
    authenticate(payload: SlackAuthPayload): Promise<AuthResult>;

    /**
     * Verifica si un usuario está autenticado y tiene acceso
     */
    verifyRequest(payload: SlackAuthPayload): Promise<AuthResult>;

    /**
     * Verifica si un usuario tiene todos los permisos requeridos
     */
    verifyPermissions(userId: string, requiredPermissions: string[]): Promise<boolean>;

    /**
     * Revoca un token específico
     */
    revokeToken(userId: string): Promise<boolean>;

    /**
     * Refresca un token existente
     */
    refreshToken(userId: string): Promise<string | null>;
} 