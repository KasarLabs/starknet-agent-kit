/**
 * Parameters for deploying an OpenZeppelin account
 * @property {string} publicKey - The public key of the account
 * @property {string} privateKey - The private key of the account
 */
export type DeployOZAccountParams = {
  publicKey: string;
  privateKey: string;
  precalculate_address: string;
};