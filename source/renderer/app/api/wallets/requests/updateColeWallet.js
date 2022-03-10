// @flow
import type { RequestConfig } from '../../common/types';
import type { BccWallet } from '../types';
import { request } from '../../utils/request';
import { getRawWalletId } from '../../utils';

export const updateColeWallet = (
  config: RequestConfig,
  { walletId, name }: { walletId: string, name: string }
): Promise<BccWallet> =>
  request(
    {
      method: 'PUT',
      path: `/v2/cole-wallets/${getRawWalletId(walletId)}`,
      ...config,
    },
    {},
    { name }
  );
