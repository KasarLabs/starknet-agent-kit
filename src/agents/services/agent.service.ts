import { Injectable, Logger } from '@nestjs/common';
import { ConfigurationService } from '../../config/configuration';
import {
  AgentExecutionError,
  StarknetTransactionError,
} from '../../common/errors';
import {
  IAgentService,
  AgentExecutionResponse,
} from '../interfaces/agent-service.interface';
import { IAgent } from '../interfaces/agent.interface';
import { AgentRequestDTO } from '../dto/agents';

@Injectable()
export class AgentService implements IAgentService {
  private readonly logger = new Logger(AgentService.name);

  constructor(private readonly config: ConfigurationService) {}

  async handleUserRequest(
    agent: IAgent,
    userRequest: AgentRequestDTO
  ): Promise<AgentExecutionResponse> {
    this.logger.debug({
      message: 'Processing agent request',
      request: userRequest.request,
    });

    try {
      const result = await agent.execute(userRequest.request);

      this.logger.debug({
        message: 'Agent request processed successfully',
        result,
      });

      return {
        status: 'success',
        data: result,
      };
    } catch (error) {
      this.logger.error('Error processing agent request', {
        error,
        request: userRequest.request,
      });

      if (error.message?.includes('transaction')) {
        throw new StarknetTransactionError('Failed to execute transaction', {
          originalError: error.message,
        });
      }

      throw new AgentExecutionError('Failed to process agent request', {
        originalError: error.message,
      });
    }
  }

  async getAgentStatus(agent: IAgent): Promise<{
    isReady: boolean;
    walletConnected: boolean;
    apiKeyValid: boolean;
  }> {
    try {
      const credentials = agent.getCredentials();

      return {
        isReady: Boolean(
          credentials.walletPrivateKey && credentials.aiProviderApiKey
        ),
        walletConnected: Boolean(credentials.walletPrivateKey),
        apiKeyValid: Boolean(credentials.aiProviderApiKey),
      };
    } catch (error) {
      this.logger.error('Error checking agent status', error);
      return {
        isReady: false,
        walletConnected: false,
        apiKeyValid: false,
      };
    }
  }
}
