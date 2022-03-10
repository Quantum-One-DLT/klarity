// @flow
import type { RequestConfig } from '../../common/types';
import type { LegacyBccWallet } from '../types';
import { request } from '../../utils/request';
import { getRawWalletId } from '../../utils';

export const getLegacyWallet = (
  config: RequestConfig,
  { walletId }: { walletId: string }
): Promise<LegacyBccWallet> =>
  request({
    method: 'GET',
    path: `/v2/cole-wallets/${getRawWalletId(walletId)}`,
    ...config,
  });
