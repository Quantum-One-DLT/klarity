// @flow
import type { RequestConfig } from '../../common/types';
import type { BccWallet } from '../types';
import { request } from '../../utils/request';

export const getWallet = (
  config: RequestConfig,
  { walletId }: { walletId: string }
): Promise<BccWallet> =>
  request({
    method: 'GET',
    path: `/v2/wallets/${walletId}`,
    ...config,
  });
