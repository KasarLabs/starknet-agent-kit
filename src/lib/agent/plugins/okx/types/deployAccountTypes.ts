/**
 * Parameters for deploying a Braavos account
 * @property {string} publicKey - The public key of the account
 * @property {string} privateKey - The private key of the account
 */
export type DeployOKXParams = {
  publicKey: string;
  privateKey: string;
  precalculate_address: string;
}
