/// <reference types="@vechain/connex" />
import { IMethodOrEventCall, ProviderInstance, SolidoProviderType, EventFilter } from '@decent-bet/solido';
import { WalletSettings } from './WalletSettings';
import { SolidoContract, SolidoSigner } from '@decent-bet/solido';
import { ConnexPlugin } from '@decent-bet/solido-provider-connex';
import WalletConnect from '@walletconnect/browser';
export declare class WalletPlugin extends ConnexPlugin implements SolidoContract {
    connex: Connex;
    chainTag: string;
    defaultAccount: string;
    address: string;
    token: string;
    walletconnect: WalletConnect;
    constructor();
    describe(): string;
    getProviderType(): SolidoProviderType;
    prepareSigning(methodCall: any, options: IMethodOrEventCall, args: any[]): Promise<SolidoSigner>;
    onReady<T>(settings: T & WalletSettings): void;
    connect(): void;
    setInstanceOptions(settings: ProviderInstance): void;
    getAbiMethod(name: string, address?: string): object;
    getMethod(name: string, address?: string): any;
    callMethod(name: string, args: any[]): any;
    getEvent(name: string): any;
    getEvents<P, T>(name: string, eventFilter?: EventFilter<T & object[]>): Promise<(P & Connex.Thor.Event)[]>;
}
