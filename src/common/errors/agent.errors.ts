import { BaseError } from './base.error';
import { ErrorType, ErrorMetadata } from './error.types';

export class AgentExecutionError extends BaseError {
  constructor(message: string, metadata?: ErrorMetadata) {
    super(ErrorType.AGENT_EXECUTION_ERROR, message, metadata);
  }
}

export class AgentInitializationError extends BaseError {
  constructor(message: string, metadata?: ErrorMetadata) {
    super(ErrorType.AGENT_INITIALIZATION_ERROR, message, metadata);
  }
}
