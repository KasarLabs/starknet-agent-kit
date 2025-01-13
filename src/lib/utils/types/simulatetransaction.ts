import { TransactionType, BigNumberish, RawArgs, RawArgsArray } from 'starknet';

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

/*Invocation DEPLOY_ACCOUNT Type */

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
