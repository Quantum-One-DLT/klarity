// @flow
import type {
  RestoreWalletStep,
  WalletKind,
  WalletKlarityKind,
  WalletYoroiKind,
  WalletHardwareKind,
  WalletColeKind,
  ImportWalletStep,
} from '../types/walletRestoreTypes';

const { isMainnet } = global.environment;

export const RESTORE_WALLET_STEPS: Array<RestoreWalletStep> = [
  'type',
  'mnemonics',
  'configuration',
  'success',
];

export const IMPORT_WALLET_STEPS: EnumMap<string, ImportWalletStep> = {
  WALLET_IMPORT_FILE: 'WalletImportFile',
  WALLET_SELECT_IMPORT: 'WalletSelectImport',
};

export const WALLET_KINDS: EnumMap<string, WalletKind> = {
  KLARITY: 'Klarity',
  YOROI: 'Yoroi',
  // HARDWARE: 'Hardware',
};

export const WALLET_KLARITY_KINDS: EnumMap<
  string,
  WalletKlarityKind
> = isMainnet
  ? {
      COLE_12_WORD: '12WordCole',
      SOPHIE_24_WORD: '24WordSophie',
      COLE_27_WORD: '27WordPaper',
    }
  : {
      COLE_12_WORD: '12WordCole',
      SOPHIE_15_WORD: '15WordSophie',
      SOPHIE_24_WORD: '24WordSophie',
      COLE_27_WORD: '27WordPaper',
    };

export const WALLET_YOROI_KINDS: EnumMap<string, WalletYoroiKind> = {
  COLE_15_WORD: '15WordCole',
  SOPHIE_15_WORD: '15WordSophie',
};

export const WALLET_HARDWARE_KINDS: EnumMap<string, WalletHardwareKind> = {
  LEDGER: 'Ledger',
  TREZOR: 'Trezor',
};

export const WALLET_KLARITY_WORD_COUNT: EnumMap<WalletKlarityKind, number> = {
  [WALLET_KLARITY_KINDS.COLE_12_WORD]: 12,
  [WALLET_KLARITY_KINDS.SOPHIE_15_WORD]: 15,
  [WALLET_KLARITY_KINDS.SOPHIE_24_WORD]: 24,
  [WALLET_KLARITY_KINDS.COLE_27_WORD]: 27,
};

export const WALLET_YOROI_WORD_COUNT: EnumMap<WalletYoroiKind, number> = {
  [WALLET_YOROI_KINDS.COLE_15_WORD]: 15,
  [WALLET_YOROI_KINDS.SOPHIE_15_WORD]: 15,
};

export const WALLET_HARDWARE_WORD_COUNT: {
  [key: WalletHardwareKind]: Array<number>,
} = {
  [WALLET_HARDWARE_KINDS.LEDGER]: [12, 18, 24],
  [WALLET_HARDWARE_KINDS.TREZOR]: [12, 18, 24],
};

export const WALLET_COLE_KINDS: EnumMap<string, WalletColeKind> = {
  ICARUS: 'icarus',
  LEDGER: 'ledger',
  RANDOM: 'random',
  TREZOR: 'trezor',
};
