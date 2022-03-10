// @flow
import type { RequestConfig } from '../../common/types';
import type { BccWallet } from '../types';
import { request } from '../../utils/requestV0';

export const importWalletAsJSON = (
  config: RequestConfig,
  filePath: string
): Promise<BccWallet> =>
  request(
    {
      method: 'POST',
      path: '/api/backup/import',
      ...config,
    },
    {},
    filePath
  );
