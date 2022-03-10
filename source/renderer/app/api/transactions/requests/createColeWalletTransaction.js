// @flow
import type { RequestConfig } from '../../common/types';
import type { Transaction, TransactionPaymentData } from '../types';
import { request } from '../../utils/request';
import { getRawWalletId } from '../../utils';

export type TransactionParams = {
  walletId: string,
  data: {
    payments: Array<TransactionPaymentData>,
    passphrase: string,
  },
};

export const createColeWalletTransaction = (
  config: RequestConfig,
  { walletId, data }: TransactionParams
): Promise<Transaction> =>
  request(
    {
      method: 'POST',
      path: `/v2/cole-wallets/${getRawWalletId(walletId)}/transactions/`,
      ...config,
    },
    {},
    data
  );
