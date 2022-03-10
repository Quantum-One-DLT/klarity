// @flow
import type { RequestConfig } from '../../common/types';
import type { BccWallet } from '../types';
import { request } from '../../utils/request';

export const updateWallet = (
  config: RequestConfig,
  { walletId, name }: { walletId: string, name: string }
): Promise<BccWallet> =>
  request(
    {
      method: 'PUT',
      path: `/v2/wallets/${walletId}`,
      ...config,
    },
    {},
    { name }
  );
