import { ProviderInterface } from 'starknet';
export interface AccountDetails {
    address: string;
    publicKey: string;
    privateKey: string;
    deployStatus: boolean;
}
export interface TransactionResult {
    status: 'success' | 'failure';
    transactionHash?: string;
    error?: string;
}
export interface BaseUtilityClass {
    provider: ProviderInterface;
}
export interface ContractDeployResult {
    transactionHash: string;
    contractAddress: string | string[];
}
export interface TokenAmount {
    amount: string;
    decimals: number;
}
export type TypedData = {
    types: {
        StarkNetDomain?: TypeElement[];
        [additionalProperties: string]: TypeElement[] | undefined;
    };
    primaryType: string;
    domain: StarkNetDomain;
    message: Record<string, unknown>;
};
export type TypeElement = {
    name: string;
    type: string;
};
export type StarkNetDomain = {
    name: string;
    version: string;
    chainId: string | number;
};
export type WeierstrassSignatureType = {
    r: string;
    s: string;
    recoveryParam?: number | null;
};
export type AiConfig = {
    apiKey: string;
    aiModel: string;
    aiProvider: string;
};
