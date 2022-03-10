// @flow
import type { RequestConfig } from '../../common/types';
import type { BccWallet } from '../types';
import { request } from '../../utils/request';
import { getRawWalletId } from '../../utils';

export const updateColeSpendingPassword = (
  config: RequestConfig,
  {
    walletId,
    oldPassword,
    newPassword,
  }: {
    walletId: string,
    oldPassword?: string,
    newPassword: string,
  }
): Promise<BccWallet> =>
  request(
    {
      method: 'PUT',
      path: `/v2/cole-wallets/${getRawWalletId(walletId)}/passphrase`,
      ...config,
    },
    {},
    {
      old_passphrase: oldPassword,
      new_passphrase: newPassword,
    }
  );
