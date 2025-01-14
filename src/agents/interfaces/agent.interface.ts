export interface IAgent {
  /**
   * Executes the user request and returns the result
   * @param input The user's request string
   * @returns Promise resolving to the execution result
   * @throws AgentExecutionError if execution fails
   */
  execute(input: string): Promise<unknown>;

  /**
   * Retrieves the agent's credentials
   * @returns Object containing wallet and API credentials
   * @throws AgentCredentialsError if credentials are invalid
   */
  getCredentials(): {
    walletPrivateKey: string;
    aiProviderApiKey: string;
    aiModel: string;
  };

  /**
   * Validates the user request before execution
   * @param request The user's request string
   * @returns Promise<boolean> indicating if request is valid
   * @throws AgentValidationError if validation fails
   */
  validateRequest(request: string): Promise<boolean>;
}
