import { ErrorHandler, Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';

/**
 * Global error handler that catches uncaught exceptions and
 * displays a user-friendly toast notification.
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
    private readonly messageService = inject(MessageService);

    handleError(error: unknown): void {
        console.error('[GlobalErrorHandler] Uncaught exception:', error);

        this.messageService.add({
            severity: 'error',
            summary: 'An error occurred',
            detail: this.extractMessage(error),
            life: 5000
        });
    }

    private extractMessage(error: unknown): string {
        if (error instanceof Error) {
            return error.message;
        }
        if (typeof error === 'string') {
            return error;
        }
        return 'Something went wrong. Please try again.';
    }
}

