// @flow

export type RestoreWalletStep =
  | 'type'
  | 'mnemonics'
  | 'configuration'
  | 'success';

export type ImportWalletStep = 'WalletImportFile' | 'WalletSelectImport';

export type WalletKind = 'Klarity' | 'Quantaverse' | 'Hardware';

export type WalletKlarityKind =
  | '12WordCole'
  | '15WordSophie'
  | '24WordSophie'
  | '27WordPaper';

export type WalletQuantaverseKind = '15WordCole' | '15WordSophie';

export type WalletColeKind = 'icarus' | 'ledger' | 'random' | 'trezor';

export type WalletHardwareKind = 'Ledger' | 'Trezor';

export type WalletSubKind =
  | WalletKlarityKind
  | WalletQuantaverseKind
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
  walletKindQuantaverse?: WalletQuantaverseKind,
  walletKindHardware?: WalletHardwareKind,
  walletSubKind: WalletSubKind,
  mnemonics: Array<string>,
  walletName: string,
  spendingPassword: string,
};
