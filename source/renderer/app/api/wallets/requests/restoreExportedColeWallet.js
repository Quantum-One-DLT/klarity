// @flow
import type { RequestConfig } from '../../common/types';
import type { LegacyBccWallet } from '../types';
import type { ExportedColeWallet } from '../../../types/walletExportTypes';
import { request } from '../../utils/request';

export const restoreExportedColeWallet = (
  config: RequestConfig,
  { walletInitData }: { walletInitData: ExportedColeWallet }
): Promise<LegacyBccWallet> =>
  request(
    {
      method: 'POST',
      path: '/v2/cole-wallets',
      ...config,
    },
    {},
    { ...walletInitData, style: 'random' }
  );
