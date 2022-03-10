// @flow
import type { RequestConfig } from '../../common/types';
import type { TransactionPaymentData, TransactionFee } from '../types';
import { request } from '../../utils/request';
import { getRawWalletId } from '../../utils';

export type GetTransactionFeeParams = {
  walletId: string,
  data: {
    payments: Array<TransactionPaymentData>,
  },
};

export const getColeWalletTransactionFee = (
  config: RequestConfig,
  { walletId, data }: GetTransactionFeeParams
): Promise<TransactionFee> =>
  request(
    {
      method: 'POST',
      path: `/v2/cole-wallets/${getRawWalletId(walletId)}/payment-fees`,
      ...config,
    },
    {},
    data
  );
