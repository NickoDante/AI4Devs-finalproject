import { MessagePort } from '../../domain/ports/MessagePort';
import { AIAdapter } from '../../domain/ports/AIAdapter';
import { PersistencePort } from '../../domain/ports/PersistencePort';
import { CachePort } from '../../domain/ports/CachePort';
import { ProcessMessageUseCase } from '../../application/use-cases/ProcessMessageUseCase';
import { Logger } from 'winston';

export class Container {
    public services: {
        ai: AIAdapter;
        persistence: PersistencePort;
        messaging: MessagePort;
        cache: CachePort;
        logger: Logger;
    };

    public useCases: {
        processMessage: ProcessMessageUseCase;
    };

    constructor() {
        this.services = {
            ai: {} as AIAdapter,
            persistence: {} as PersistencePort,
            messaging: {} as MessagePort,
            cache: {} as CachePort,
            logger: {} as Logger
        };

        this.useCases = {
            processMessage: {} as ProcessMessageUseCase
        };
    }
} 