// @flow

// BCC
export const MAX_TRANSACTIONS_ON_SUMMARY_PAGE = 5;
export const MAX_TRANSACTIONS_PER_PAGE = 50;
export const MAX_TRANSACTION_CONFIRMATIONS = 20; // maximum number of confirmations shown in the UI
export const MAX_BCC_WALLETS_COUNT = 30; // 50 is an absolute max due to V1 API per_page limitation
export const ENTROPICS_PER_BCC = 1000000;
export const MAX_INTEGER_PLACES_IN_BCC = 11;
export const DECIMAL_PLACES_IN_BCC = 6;
export const TX_AGE_POLLING_THRESHOLD = 15 * 60 * 1000; // 15 minutes | unit: milliseconds

// Keyboard events
export const ENTER_KEY_CODE = 13;
export const ESCAPE_KEY_CODE = 27;
