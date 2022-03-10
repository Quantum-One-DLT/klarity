// @flow

export type RestoreWalletStep =
  | 'type'
  | 'mnemonics'
  | 'configuration'
  | 'success';

export type ImportWalletStep = 'WalletImportFile' | 'WalletSelectImport';

export type WalletKind = 'Klarity' | 'Yoroi' | 'Hardware';

export type WalletKlarityKind =
  | '12WordCole'
  | '15WordSophie'
  | '24WordSophie'
  | '27WordPaper';

export type WalletYoroiKind = '15WordCole' | '15WordSophie';

export type WalletColeKind = 'icarus' | 'ledger' | 'random' | 'trezor';

export type WalletHardwareKind = 'Ledger' | 'Trezor';

export type WalletSubKind =
  | WalletKlarityKind
  | WalletYoroiKind
  | WalletHardwareKind;

export type WalletKinds = WalletKind | WalletSubKind;

export type HardwareWalletAcceptance =
  | 'hardwareWalletAcceptance1'
  | 'hardwareWalletAcceptance2'
  | 'hardwareWalletAcceptance3';

export type WalletRestoreDataParam =
  | 'walletKind'
  | 'walletSubKind'
  | 'mnemonics'
  | 'walletName'
  | 'spendingPassword';

export type WalletRestoreData = {
  walletKind: WalletKind,
  walletKindKlarity?: WalletKlarityKind,
  walletKindYoroi?: WalletYoroiKind,
  walletKindHardware?: WalletHardwareKind,
  walletSubKind: WalletSubKind,
  mnemonics: Array<string>,
  walletName: string,
  spendingPassword: string,
};
