export interface WalletTransaction {
    from: string;
    to: string;
    data: string;
    gasPrice?: number;
    gasLimit?: number;
    value?: string;
    nonce?: string;
}