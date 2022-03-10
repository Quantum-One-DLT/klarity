// @flow
import type { RequestConfig } from '../../common/types';
import type { LegacyBccWallets } from '../types';
import { request } from '../../utils/request';

export const getLegacyWallets = (
  config: RequestConfig
): Promise<LegacyBccWallets> =>
  request({
    method: 'GET',
    path: '/v2/cole-wallets',
    ...config,
  });
