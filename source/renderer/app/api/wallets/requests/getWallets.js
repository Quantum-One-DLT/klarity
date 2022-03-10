// @flow
import type { RequestConfig } from '../../common/types';
import type { BccWallets } from '../types';
import { request } from '../../utils/request';

export const getWallets = (config: RequestConfig): Promise<BccWallets> =>
  request({
    method: 'GET',
    path: '/v2/wallets',
    ...config,
  });
