import { AuthInfo } from '../../infrastructure/middleware/types';

declare global {
    namespace Express {
        interface Request {
            auth?: AuthInfo;
        }
    }
} 