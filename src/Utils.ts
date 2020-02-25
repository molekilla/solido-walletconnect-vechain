// eslint-disable-next-line spaced-comment
/// <reference types="@vechain/connex" />

import { filter } from 'rxjs/operators';
import { Observable, Observer, from } from 'rxjs';
/**
 * blockConfirmationUntil operator waits until transaction is confirmed
 * @param transactionId transaction id
 */
export const blockConfirmationUntil$ = (transactionId: string) =>
    Observable.create(async (observer: Observer<boolean>) => {
        let block: Connex.Thor.Block = await connex.thor.block().get();
        let hasBlock = await connex.thor.transaction(transactionId).get();
        while (!hasBlock) {
            await connex.thor.ticker().next();
            block = await connex.thor.block().get();
            hasBlock = await connex.thor.transaction(transactionId).get();
        }
        observer.next(!!hasBlock);
        observer.complete();
    });


export const blockConfirmationUntil = (transactionId: string) => blockConfirmationUntil$(transactionId).toPromise();



/**
 * waitConfirmationUntil operator waits until transaction is confirmed
 * @param transactionId transaction id
 */
export const waitConfirmationUntil = (address: string, clause: any) =>
    Observable.create(async (observer: Observer<Connex.Thor.Receipt>) => {
        let hasBlock = null;
        let block;

        while (!hasBlock) {
            // get ticker
            await connex.thor.ticker().next();

            // get block
            block = await connex.thor.block().get();

            // get block transactions
            const { transactions }: { transactions: Array<Connex.Thor.Transaction> } = block;

            // get all txs by address
            const hasTransaction = await from(transactions)
                .pipe(
                    filter(i => i.origin === address)
                )
                .toPromise();

            // if tx and tx has clauses, 
            // if clause match, then read receipt and return
            if (hasTransaction && hasTransaction.clauses.length > 0) {
                hasTransaction.clauses.find(async c => {
                    if (c.to === clause.to
                        && c.value === clause.value
                        && c.data === clause.data) {
                        const receipt = await connex.thor.transaction(hasTransaction.id).getReceipt();
                        observer.next(receipt);
                        observer.complete();
                        return;
                    }
                })
            }
            hasBlock = true;
        }
    });
