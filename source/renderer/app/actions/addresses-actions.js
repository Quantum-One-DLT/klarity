// @flow
import Action from './lib/Action';

// ======= ADDRESSES ACTIONS =======

export default class AddressesActions {
  createColeWalletAddress: Action<{
    walletId: string,
    passphrase: string,
  }> = new Action();
  resetErrors: Action<any> = new Action();
}
