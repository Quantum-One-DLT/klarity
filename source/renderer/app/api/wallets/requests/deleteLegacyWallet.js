// @flow
import type { RequestConfig } from '../../common/types';
import { request } from '../../utils/request';
import { getRawWalletId } from '../../utils';

export const deleteLegacyWallet = (
  config: RequestConfig,
  { walletId }: { walletId: string }
): Promise<*> =>
  request({
    method: 'DELETE',
    path: `/v2/cole-wallets/${getRawWalletId(walletId)}`,
    ...config,
  });
