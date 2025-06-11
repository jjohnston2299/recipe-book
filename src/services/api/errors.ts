export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class NetworkError extends APIError {
  constructor(message = 'Network error occurred') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends APIError {
  constructor(message: string, details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends APIError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class AIServiceError extends APIError {
  constructor(message: string, details?: unknown) {
    super(message, 500, 'AI_SERVICE_ERROR', details);
    this.name = 'AIServiceError';
  }
}

export async function handleAPIResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    switch (response.status) {
      case 400:
        throw new ValidationError(errorData.message || 'Invalid request', errorData.details);
      case 404:
        throw new NotFoundError(errorData.resource || 'Resource');
      case 500:
        if (errorData.code === 'AI_SERVICE_ERROR') {
          throw new AIServiceError(errorData.message || 'AI service error', errorData.details);
        }
        throw new APIError('Internal server error', 500, errorData.code, errorData.details);
      default:
        throw new APIError(
          errorData.message || 'An unexpected error occurred',
          response.status,
          errorData.code,
          errorData.details
        );
    }
  }

  return response.json();
}

export function isAPIError(error: unknown): error is APIError {
  return error instanceof APIError;
} 