import { TransactionReceipt, TransactionStatus } from 'starknet';
import { BaseUtilityClass } from '../../account/types/accounts';
export declare class TransactionMonitor implements BaseUtilityClass {
    provider: any;
    private readonly pollingInterval;
    constructor(provider: any, pollingInterval?: number);
    waitForTransaction(txHash: string, callback?: (status: TransactionStatus) => void): Promise<TransactionReceipt>;
    getTransactionEvents(txHash: string): Promise<Event[]>;
    watchEvents(fromBlock: number, toBlock: number | "latest" | undefined, callback: (events: Event[]) => void): Promise<void>;
    getTransactionStatus(txHash: string): Promise<TransactionStatus>;
}
