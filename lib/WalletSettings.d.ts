/// <reference types="@vechain/connex" />
import WalletConnect from '@walletconnect/browser';
export declare class WalletSettings {
    connex: Connex;
    chainTag: string;
    defaultAccount: string;
    walletconnect: WalletConnect;
}
