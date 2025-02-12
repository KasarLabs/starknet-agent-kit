/**
 * Parameters for deploying an Argent account
 * @property {string} publicKeyAX - The Argent X public key
 * @property {string} privateKeyAX - The Argent X private key
 */
export type DeployArgentParams = {
    publicKeyAX: string;
    privateKeyAX: string;
    precalculate_address: string;
  };
  