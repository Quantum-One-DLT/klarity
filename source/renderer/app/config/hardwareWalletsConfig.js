const { isMainnet, isTestnet } = global.environment;

export const HARDENED_HEX = 0x80000000;
export const HARDENED = 2147483648;
export const SOPHIE_PURPOSE_INDEX = 1852;
export const COLE_PURPOSE_INDEX = 44;
export const BCC_COIN_TYPE = 1815;
export const DEFAULT_ADDRESS_INDEX = 0;

export const HW_SOPHIE_CONFIG = {
  NETWORK: {
    MAINNET: {
      name: 'mainnet',
      networkId: 1,
      protocolMagic: 764824073,
      trezorProtocolMagic: 764824073,
      eraStartSlot: 4492800,
      ttl: 3600,
    },
    TESTNET: {
      name: 'testnet',
      networkId: 0,
      protocolMagic: 1097911063,
      trezorProtocolMagic: 1097911063,
      eraStartSlot: 4492800,
      ttl: 3600,
    },
  },
  DEFAULT_DERIVATION_PATH: [
    HARDENED + SOPHIE_PURPOSE_INDEX,
    HARDENED + BCC_COIN_TYPE,
    HARDENED + DEFAULT_ADDRESS_INDEX,
    2,
    0,
  ],
  ABS_DERIVATION_PATH: [
    HARDENED + SOPHIE_PURPOSE_INDEX,
    HARDENED + BCC_COIN_TYPE,
    HARDENED + DEFAULT_ADDRESS_INDEX,
  ],
};

export const HW_COLE_CONFIG = {
  NETWORK: {
    MAINNET: {
      name: 'mainnet',
      networkId: 1,
      protocolMagic: 764824073,
    },
  },
  DEFAULT_DERIVATION_PATH: [
    HARDENED + COLE_PURPOSE_INDEX,
    HARDENED + BCC_COIN_TYPE,
    HARDENED + DEFAULT_ADDRESS_INDEX,
    2,
    0,
  ],
  ABS_DERIVATION_PATH: [
    HARDENED + COLE_PURPOSE_INDEX,
    HARDENED + BCC_COIN_TYPE,
    HARDENED + DEFAULT_ADDRESS_INDEX,
  ],
};

export const AddressTypeNibbles = {
  BASE: 0b0000,
  POINTER: 0b0100,
  ENTERPRISE: 0b0110,
  COLE: 0b1000,
  REWARD: 0b1110,
};

// MINIMAL_BCC_APP_VERSION v2.3.2 - Catalyst Voting support with LedgerJs 3.1.0 version
// https://github.com/theblockchaincompany/ledgerjs-hw-app-bcc/blob/master/CHANGELOG.md
export const MINIMAL_BCC_APP_VERSION = '2.3.2';
export const MINIMAL_LEDGER_FIRMWARE_VERSION = '2.0.0';
export const MINIMAL_TREZOR_FIRMWARE_VERSION = '2.4.0';

export const isTrezorEnabled = true;
export const isLedgerEnabled = true;

export const isHardwareWalletSupportEnabled =
  (isMainnet || isTestnet) && (isTrezorEnabled || isLedgerEnabled);

export const isHardwareWalletIndicatorEnabled = false;
