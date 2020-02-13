import { SolidoSigner } from '@decent-bet/solido';
import WalletConnect from '@walletconnect/browser';

export class WalletSigner implements SolidoSigner {
    constructor(public payload: any, 
                public walletconnect: WalletConnect) {}

    async requestSigning(): Promise<any> {
        try {
            return this.walletconnect.signTransaction(this.payload);
        } catch (error) {
            throw error;
        }
    }
}
