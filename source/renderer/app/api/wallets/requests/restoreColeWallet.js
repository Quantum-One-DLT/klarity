// @flow
import type { RequestConfig } from '../../common/types';
import type { LegacyBccWallet, LegacyWalletInitData } from '../types';
import type { WalletColeKind } from '../../../types/walletRestoreTypes';
import { request } from '../../utils/request';

export const restoreColeWallet = (
  config: RequestConfig,
  { walletInitData }: { walletInitData: LegacyWalletInitData },
  type: WalletColeKind
): Promise<LegacyBccWallet> =>
  request(
    {
      method: 'POST',
      path: '/v2/cole-wallets',
      ...config,
    },
    {},
    { ...walletInitData, style: type }
  );
