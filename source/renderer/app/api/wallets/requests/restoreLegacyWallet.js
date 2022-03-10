// @flow
import type { RequestConfig } from '../../common/types';
import type { LegacyBccWallet, LegacyWalletInitData } from '../types';
import { request } from '../../utils/request';

export const restoreLegacyWallet = (
  config: RequestConfig,
  { walletInitData }: { walletInitData: LegacyWalletInitData },
  type?: string = ''
): Promise<LegacyBccWallet> => {
  const queryParams = {};
  return request(
    {
      method: 'POST',
      path: `/v2/cole-wallets${type}`,
      ...config,
    },
    queryParams,
    walletInitData
  );
};
