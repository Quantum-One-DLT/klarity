// @flow
import type { RequestConfig } from '../../common/types';
import type { Addresses, GetAddressesRequestQueryParams } from '../types';
import { request } from '../../utils/request';
import { getRawWalletId } from '../../utils';

export const getColeWalletAddresses = (
  config: RequestConfig,
  walletId: string,
  queryParams?: GetAddressesRequestQueryParams
): Promise<Addresses> =>
  request(
    {
      method: 'GET',
      path: `/v2/cole-wallets/${getRawWalletId(walletId)}/addresses`,
      ...config,
    },
    queryParams
  );
