"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const solido_1 = require("@decent-bet/solido");
const WalletSigner_1 = require("./WalletSigner");
const solido_provider_connex_1 = require("@decent-bet/solido-provider-connex");
class WalletPlugin extends solido_provider_connex_1.ConnexPlugin {
    constructor() {
        super();
    }
    describe() {
        return `
    contract address: ${this.address}\r\n
    chain tag: ${this.chainTag}\r\n
    owner: ${this.defaultAccount}\r\n    
    `;
    }
    getProviderType() {
        return solido_1.SolidoProviderType.Connex;
    }
    prepareSigning(methodCall, options, args) {
        const payload = methodCall.asClause(...args);
        payload.from = this.defaultAccount;
        const signer = new WalletSigner_1.WalletSigner(payload, this.walletconnect);
        return Promise.resolve(signer);
    }
    onReady(settings) {
        const { connex, chainTag, defaultAccount, walletconnect } = settings;
        this.connex = connex;
        this.chainTag = chainTag;
        this.defaultAccount = defaultAccount;
        this.walletconnect = walletconnect;
        this.connect();
    }
    connect() {
        if (this.connex && this.chainTag && this.defaultAccount) {
            this.address = this.contractImport.address[this.chainTag];
        }
        else {
            throw new Error('Missing onReady settings');
        }
    }
    setInstanceOptions(settings) {
        this.connex = settings.provider;
        this.walletconnect = settings.options.walletconnect;
        if (settings.options.chainTag) {
            this.chainTag = settings.options.chainTag;
        }
        if (settings.options.defaultAccount) {
            this.defaultAccount = settings.options.defaultAccount;
        }
    }
    getAbiMethod(name, address) {
        let addr;
        if (!address) {
            addr = this.contractImport.address[this.chainTag];
        }
        return this.abi.filter(i => i.name === name)[0];
    }
    getMethod(name, address) {
        let addr;
        addr = this.contractImport.address[this.chainTag];
        const acc = this.connex.thor.account(addr);
        let methodAbi = name;
        if (typeof name === 'string') {
            methodAbi = this.abi.filter(i => i.name === name)[0];
        }
        const connexMethod = acc.method(methodAbi);
        return Object.assign({}, connexMethod);
    }
    callMethod(name, args) {
        let addr = this.contractImport.address[this.chainTag];
        const acc = this.connex.thor.account(addr);
        let methodAbi = name;
        if (typeof name === 'string') {
            methodAbi = this.abi.filter(i => i.name === name)[0];
        }
        return acc.method(methodAbi).call(...args);
    }
    getEvent(name) {
        let addr = this.contractImport.address[this.chainTag];
        const acc = this.connex.thor.account(addr);
        let eventAbi;
        if (typeof name === 'string') {
            eventAbi = this.abi.filter(i => i.name === name)[0];
        }
        return acc.event(eventAbi);
    }
    getEvents(name, eventFilter) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = this.getEvent(name);
            let offset = 0;
            let limit = 25;
            if (eventFilter) {
                const { range, filter, order, pageOptions, topics } = eventFilter;
                let connexFilter = event.filter(filter || []);
                if (topics) {
                    let criteria = topics.get();
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
                return (yield connexFilter.apply(offset, limit));
            }
            return (yield event.filter([]).apply(offset, limit));
        });
    }
}
exports.WalletPlugin = WalletPlugin;
