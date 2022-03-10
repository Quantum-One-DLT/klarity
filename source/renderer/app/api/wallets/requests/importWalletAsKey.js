// @flow
import type { RequestConfig } from '../../common/types';
import type { BccWallet } from '../types';
import { request } from '../../utils/request';

export type ImportWalletAsKey = {
  filePath: string,
  spendingPassword: string,
};

export const importWalletAsKey = (
  config: RequestConfig,
  walletImportData: ImportWalletAsKey
): Promise<BccWallet> =>
  request(
    {
      method: 'POST',
      path: '/api/internal/import-wallet',
      ...config,
    },
    {},
    walletImportData
  );
