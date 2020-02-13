# solido-provider-wallet
Solido Wallet Provider

## Implementing WalletConnect Protocol for a VeChain Dapp


`solido-provider-wallet` is a wrapper for `solido-provider-connex` which injects a `SolidoSigner` interface that sends signing requests to WalletConnect.

Additionally, a Dapp needs to instantiate a self hosted connex. To create a new connex instance, add `@vechain/connex-framework` and `@vechain/connex.driver-nodejs`. The latter only works with server side applications but is enough to let us create a connex object.

```typescript
        import { Framework } from '@vechain/connex-framework';
        import {
        Driver, SimpleNet
        } from '@vechain/connex.driver-nodejs';

      const driver = await Driver.connect(new SimpleNet('https://thor-staging.decent.bet'));
      const connex = new Framework(driver);

      const _ = await connex.thor.block(0).get();
      const { id } = connex.thor.genesis;
      const chainTag = `0x${id.substring(id.length - 2, id.length)}`;
      const thorify = getThorify();
      const walletconnect = new WalletConnect({
        bridge: 'https://bridge.walletconnect.org',
      });

      const config: SolidoProviderConfig = {
        connex: {
          connex,
          chainTag,
          defaultAccount,
          walletconnect
        },
        // read only, set a null private key
        thorify: {
          privateKey: '',
          chainTag,
          from: defaultAccount,
          thor: thorify
        }
      };

```

## Start pairing session

WalletConnect requires users to scan a QR image, which contains  session info and wallet bridge to connect to. When the wallet approves a session request, Dapp will received the current account address. 

```typescript
    const walletconnect = new WalletConnect({
      bridge: 'https://bridge.walletconnect.org',
    });
    (window as any).walletconnect = walletconnect;

    // Subscribe to connection events
    walletconnect.on('connect', async (error, payload) => {
      if (error) {
        throw error;
      }

      // Close QR Code Modal
      WalletConnectQRCodeModal.close();

      // Get provided accounts and chainId
      const { accounts, chainId } = payload.params[0];
      localStorage.setItem('playdbet:user:defaultAccount', accounts[0]);
      console.log(accounts);
    });

    walletconnect.on('session_update', (error, payload) => {
      if (error) {
        throw error;
      }

      // Get updated accounts and chainId
      const { accounts, chainId } = payload.params[0];
      console.log(payload.accounts);
    });

    walletconnect.on('disconnect', (error, payload) => {
      if (error) {
        throw error;
      }
      console.log(payload);
      // Delete walletConnector
    });

    // Check if connection is already established
    if (!walletconnect.connected) {
      // create new session
      await walletconnect.createSession();
      // get uri for QR Code modal
      const { uri } = walletconnect;
      // display QR Code modal
      WalletConnectQRCodeModal.open(uri, () => {
        console.log('QR Code Modal closed');
      });
    }

```

## Signing

Dapp requires only that each contract uses `solido-provider-wallet` as plugin. 