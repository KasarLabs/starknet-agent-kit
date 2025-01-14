<<<<<<< HEAD
import { TransactionType, BigNumberish, RawArgs, RawArgsArray,ContractClass, Signature} from "starknet";
=======
import { TransactionType, BigNumberish, RawArgs, RawArgsArray } from 'starknet';
>>>>>>> main

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

<<<<<<< HEAD
/*Invocation Deploy_Account Type */
=======
/*Invocation DEPLOY_ACCOUNT Type */
>>>>>>> main

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
<<<<<<< HEAD

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
=======
>>>>>>> main
