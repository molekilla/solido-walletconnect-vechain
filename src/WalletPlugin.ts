// eslint-disable-next-line spaced-comment
/// <reference types="@vechain/connex" />
import { abi } from 'thor-devkit';
import {
  IMethodOrEventCall,
  ProviderInstance,
  SolidoProviderType,
  IMethodConfig,
  EventFilter,
  SolidoTopic,
} from '@decent-bet/solido';
import { WalletSigner } from './WalletSigner';
import { WalletSettings } from './WalletSettings';
import { SolidoContract, SolidoSigner } from '@decent-bet/solido';
import { ConnexPlugin } from '@decent-bet/solido-provider-connex';
import { WalletTransaction } from './WalletTransaction';
import WalletConnect from '@walletconnect/browser';

/**
 * WalletPlugin provider for Solido
 */
export class WalletPlugin extends ConnexPlugin implements SolidoContract {
  public connex: Connex;
  public chainTag: string;
  public defaultAccount: string;
  public address: string;
  public token: string;
  public walletconnect: WalletConnect;

  constructor() {
    super();
  }

  public describe(): string {
    return `
    contract address: ${this.address}\r\n
    chain tag: ${this.chainTag}\r\n
    owner: ${this.defaultAccount}\r\n    
    `;
  }

  public getProviderType(): SolidoProviderType {
    return SolidoProviderType.Connex;
  }


  public prepareSigning(
    methodCall: any,
    options: IMethodOrEventCall,
    args: any[]
  ): Promise<SolidoSigner> {
    const payload = methodCall.asClause(...args);
    payload.from = this.defaultAccount;
    const signer = new WalletSigner(<WalletTransaction>payload, this.walletconnect);
    return Promise.resolve(signer);
  }


  public onReady<T>(settings: T & WalletSettings): void {
    const { connex, chainTag, defaultAccount, walletconnect } = settings;
    this.connex = connex;
    this.chainTag = chainTag;
    this.defaultAccount = defaultAccount;
    this.walletconnect = walletconnect;
    this.connect();
  }

  public connect() {
    if (this.connex && this.chainTag && this.defaultAccount) {
      this.address = this.contractImport.address[this.chainTag];
    } else {
      throw new Error('Missing onReady settings');
    }
  }

  public setInstanceOptions(settings: ProviderInstance) {
    this.connex = settings.provider;
    this.walletconnect  = settings.options.walletconnect;
    if (settings.options.chainTag) {
      this.chainTag = settings.options.chainTag;
    }
    if (settings.options.defaultAccount) {
      this.defaultAccount = settings.options.defaultAccount;
    }
  }

  public getAbiMethod(name: string, address?: string): object {
    let addr;
    if (!address) {
      addr = this.contractImport.address[this.chainTag];
    }
    return this.abi.filter(i => i.name === name)[0];
  }

  /**
   * Gets a Connex Method object
   * @param address contract address
   * @param methodAbi method ABI
   */
  public getMethod(name: string, address?: string): any {
    let addr;
    addr = this.contractImport.address[this.chainTag];
    const acc = this.connex.thor.account(addr);
    let methodAbi: any = name;
    if (typeof name === 'string') {
      methodAbi = this.abi.filter(
        i => i.name === name
      )[0] as abi.Function.Definition;
    }

    const connexMethod = acc.method(methodAbi as object);
    return Object.assign({}, connexMethod);
  }

  public callMethod(name: string, args: any[]): any {
    let addr = this.contractImport.address[this.chainTag];
    const acc = this.connex.thor.account(addr);
    let methodAbi: any = name;
    if (typeof name === 'string') {
      methodAbi = this.abi.filter(
        i => i.name === name
      )[0] as abi.Function.Definition;
    }
    return acc.method(methodAbi as object).call(...args);
  }
  /**
   * Gets a Connex Event object
   * @param address contract address
   * @param eventAbi event ABI
   */
  public getEvent(name: string): any {
    let addr = this.contractImport.address[this.chainTag];
    const acc = this.connex.thor.account(addr);

    let eventAbi: any;
    if (typeof name === 'string') {
      eventAbi = this.abi.filter(
        i => i.name === name
      )[0] as abi.Event.Definition;
    }
    return acc.event(eventAbi as any);
  }

  public async getEvents<P, T>(
    name: string,
    eventFilter?: EventFilter<T & object[]>
  ): Promise<(P & Connex.Thor.Event)[]> {
    const event: Connex.Thor.EventVisitor = this.getEvent(name);

    // default page options
    let offset = 0;
    let limit = 25;

    if (eventFilter) {
      const { range, filter, order, pageOptions, topics } = eventFilter;
      let connexFilter: Connex.Thor.Filter<'event'> = event.filter(
        filter || []
      );

      if (topics) {
        let criteria = (topics as SolidoTopic).get();
        connexFilter = connexFilter.criteria(criteria);
      }

      if (range) {
        const { unit, to, from } = range;
        connexFilter = connexFilter.range({
          unit,
          from,
          to
        });
      }

      connexFilter = connexFilter.order(order || 'desc');

      if (pageOptions) {
        offset = pageOptions.offset;
        limit = pageOptions.limit;
      }
      return (await connexFilter.apply(offset, limit)) as (P &
        Connex.Thor.Event)[];
    }

    return (await event.filter([]).apply(offset, limit)) as (P &
      Connex.Thor.Event)[];
  }
  
}
