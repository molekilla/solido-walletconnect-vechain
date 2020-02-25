import { SolidoSigner } from '@decent-bet/solido';
import WalletConnect from '@walletconnect/browser';
import { waitConfirmationUntil } from './Utils';

export class WalletSigner implements SolidoSigner {
    constructor(
        public from: any,
        public payload: any,
        public walletconnect: WalletConnect) { }

    async requestSigning(): Promise<any> {
        try {
            await this.walletconnect.signTransaction(this.payload);

            return waitConfirmationUntil(this.from, this.payload).toPromise();
        } catch (error) {
            throw error;
        }
    }
}
