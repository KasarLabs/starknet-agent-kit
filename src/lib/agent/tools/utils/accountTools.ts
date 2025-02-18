import { AccountResponse } from '../../plugins/core/account/types/accounts';

/**
 * Wraps account creation response to format it according to the mode
 * @param response The raw JSON response from account creation
 * @param isSignatureMode Whether we're in signature mode or key mode
 * @returns Formatted JSON response
 */
export const wrapAccountCreationResponse = (response: string) => {
  try {
    const data = JSON.parse(response) as AccountResponse;
    if (data.status === 'success') {
        return JSON.stringify({
          ...data,
          message: `✅ Your ${data.wallet} account has been successfully created at ${data.contractAddress}\nPublic key: ${data.publicKey}\nPrivate key: ${data.privateKey}`
        });
    }
    return response;
  } catch {
    return response;
  }
}; 