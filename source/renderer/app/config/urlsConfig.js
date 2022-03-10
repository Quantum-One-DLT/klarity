// @flow
import { currencyConfig } from './currencyConfig';

export const MAINNET_EXPLORER_URL = 'explorer.bcc.org';
export const STAGING_EXPLORER_URL = 'explorer.staging.bcc.org';
export const TESTNET_EXPLORER_URL = 'explorer.bcc-testnet.tbcodev.io';

export const DEVELOPMENT_NEWS_URL = 'newsfeed.klarity.io';
export const MAINNET_NEWS_URL = 'newsfeed.klarity.io';
export const TESTNET_NEWS_URL = 'newsfeed.klarity.io';
export const STAGING_NEWS_URL = 'newsfeed.klarity.io';

export const DEVELOPMENT_NEWS_HASH_URL = 'newsfeed.klaritywallet.io';
export const MAINNET_NEWS_HASH_URL = 'newsfeed.klaritywallet.io';
export const TESTNET_NEWS_HASH_URL = 'newsfeed.klaritywallet.io';
export const STAGING_NEWS_HASH_URL = 'newsfeed.klaritywallet.io';

export const ALLOWED_EXTERNAL_HOSTNAMES = [
  MAINNET_EXPLORER_URL,
  STAGING_EXPLORER_URL,
  TESTNET_EXPLORER_URL,
  DEVELOPMENT_NEWS_URL,
  MAINNET_NEWS_URL,
  TESTNET_NEWS_URL,
  STAGING_NEWS_URL,
  DEVELOPMENT_NEWS_HASH_URL,
  MAINNET_NEWS_HASH_URL,
  TESTNET_NEWS_HASH_URL,
  STAGING_NEWS_HASH_URL,
  currencyConfig.hostname,
];
