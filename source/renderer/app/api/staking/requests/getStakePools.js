// @flow
import type { RequestConfig } from '../../common/types';
import type { BccApiStakePools } from '../types';
import { request } from '../../utils/request';

export const getStakePools = (
  config: RequestConfig,
  stake: number
): Promise<BccApiStakePools> =>
  request(
    {
      method: 'GET',
      path: '/v2/stake-pools',
      ...config,
    },
    { stake }
  );
