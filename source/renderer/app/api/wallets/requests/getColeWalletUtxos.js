// @flow
import type { RequestConfig } from '../../common/types';
import type { WalletUtxos } from '../types';
import { request } from '../../utils/request';
import { getRawWalletId } from '../../utils';

export const getColeWalletUtxos = (
  config: RequestConfig,
  { walletId }: { walletId: string }
): Promise<WalletUtxos> =>
  request({
    method: 'GET',
    path: `/v2/cole-wallets/${getRawWalletId(walletId)}/statistics/utxos`,
    ...config,
  });
