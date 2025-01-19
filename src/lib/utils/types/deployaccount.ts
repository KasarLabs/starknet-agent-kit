import { StarknetAgentInterface } from 'src/lib/agent/tools';

/**
 * Parameters for deploying an OpenZeppelin account
 * @property {string} publicKey - The public key of the account
 * @property {string} privateKey - The private key of the account
 */
export type DeployOZAccountParams = {
  publicKey: string;
  agent: StarknetAgentInterface;
};

/**
 * Parameters for deploying an Argent account
 * @property {string} publicKeyAX - The Argent X public key
 * @property {string} privateKeyAX - The Argent X private key
 */
export type DeployArgentParams = {
  publicKeyAX: string;
  privateKeyAX: string;
};
