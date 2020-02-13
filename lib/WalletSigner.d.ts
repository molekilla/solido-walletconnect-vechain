import { SolidoSigner } from '@decent-bet/solido';
import WalletConnect from '@walletconnect/browser';
export declare class WalletSigner implements SolidoSigner {
    payload: any;
    walletconnect: WalletConnect;
    constructor(payload: any, walletconnect: WalletConnect);
    requestSigning(): Promise<any>;
}
