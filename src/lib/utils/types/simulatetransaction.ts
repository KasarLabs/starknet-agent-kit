import {
  TransactionType,
  BigNumberish,
  RawArgs,
  CompiledContract,
  CairoAssembly,
  DeployAccountContractPayload,
  UniversalDeployerContractPayload,
  Call,
} from 'starknet';

/*Invocation Invoke Type */
export type InvocationInvokePayload = {
  contractAddress: string;
  entrypoint: string;
  calldata: string[];
};

export type Invocation_Invoke = {
  type: TransactionType.INVOKE;
  payload: InvocationInvokePayload;
};

export type simulateInvokeTransactionParams = {
  accountAddress: string;
  payloads: Call[];
};

/*Invocation Deploy_Account Type */

export type Invocation_Deploy_Account_Payload = {
  classHash: string;
  constructorCalldata?: RawArgs;
  addressSalt?: BigNumberish;
  contractAddress?: string;
};

export type Invocation_Deploy_Account = {
  type: TransactionType.DEPLOY_ACCOUNT;
  payload: Invocation_Deploy_Account_Payload;
};

export type simulateDeployTransactionAccountParams = {
  accountAddress: string;
  payloads: DeployAccountContractPayload[];
};

/*Invocation Deploy Type */

export type Invocation_Deploy_Payload = {
  classHash: BigNumberish;
  salt?: string;
  unique?: boolean;
  constructorCalldata?: RawArgs;
};

export type Invocation_Deploy = {
  type: TransactionType.DEPLOY;
  payload: Invocation_Deploy_Payload;
};

export type simulateDeployTransactionParams = {
  accountAddress: string;
  payloads: UniversalDeployerContractPayload[];
};

/* Invocation Declare Type */

export type simulateDeclareTransactionAccountParams = {
  accountAddress: string;
  contract: string | CompiledContract;
  classHash?: string;
  casm?: CairoAssembly;
  compiledClassHash?: string;
};
