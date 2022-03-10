// @flow
import BigNumber from 'bignumber.js';
import StakePool from '../../domains/StakePool';
import Wallet from '../../domains/Wallet';

export type DelegationAction =
  | 'changeDelegation'
  | 'removeDelegation'
  | 'delegate';

export type BccApiStakePoolFlag = 'delisted';
export type BccApiStakePoolFlags = Array<BccApiStakePoolFlag>;

export type BccApiStakePool = {
  id: string,
  metrics: {
    non_myopic_member_rewards: {
      quantity: number,
      unit: 'entropic',
    },
    produced_blocks: {
      quantity: number,
      unit: 'block',
    },
    relative_stake: {
      quantity: number,
      unit: 'percent',
    },
    saturation: number,
  },
  cost: {
    quantity: number,
    unit: 'entropic',
  },
  margin: {
    quantity: number,
    unit: 'percent',
  },
  metadata: {
    ticker: string, // [3 .. 5] characters
    name: string, // [1 .. 50] characters
    description?: string, // <= 255 characters
    homepage: string,
  },
  pledge: {
    quantity: number,
    unit: 'entropic',
  },
  retirement: {
    epoch_number: number,
    epoch_start_time: string,
  },
  flags: BccApiStakePoolFlags,
};
export type BccApiStakePools = Array<BccApiStakePool>;

export type Reward = {
  date?: string,
  wallet: string,
  reward: BigNumber,
  rewardsAddress: string,
  pool?: StakePool,
};

export type EpochData = {
  pool: StakePool,
  slotsElected: Array<number>,
  performance?: Array<number>,
  sharedRewards?: Array<number>,
};

export type Epoch = {
  id: number,
  name: string,
  progress?: number,
  endsAt?: string,
  data: Array<EpochData>,
};

export type JoinStakePoolRequest = {
  walletId: string,
  stakePoolId: string,
  passphrase: ?string,
  isHardwareWallet?: boolean,
};

export type GetDelegationFeeRequest = {
  walletId: string,
};

export type DelegationCalculateFeeResponse = {
  fee: BigNumber,
  deposits: BigNumber,
  depositsReclaimed: BigNumber,
};

export type QuitStakePoolRequest = {
  walletId: string,
  passphrase: string,
  isHardwareWallet?: boolean,
};

export type GetRedeemItnRewardsFeeRequest = {
  address: string,
  wallet: Wallet,
  recoveryPhrase: Array<string>,
};

export type GetRedeemItnRewardsFeeResponse = BigNumber;

export type RequestRedeemItnRewardsRequest = {
  address: string,
  walletId: string,
  spendingPassword: string,
  recoveryPhrase: Array<string>,
};

export type RequestRedeemItnRewardsResponse = BigNumber;

export type PoolMetadataSource = 'none' | 'direct' | string;

export type UpdateSmashSettingsRequest = {
  settings: {
    pool_metadata_source: PoolMetadataSource,
  },
};

export type GetSmashSettingsResponse = {
  pool_metadata_source: PoolMetadataSource,
};

export type GetSmashSettingsApiResponse = PoolMetadataSource;

export type SmashServerStatuses =
  | 'available'
  | 'unavailable'
  | 'unreachable'
  | 'no_smash_configured';

export type CheckSmashServerHealthApiResponse = {
  health: SmashServerStatuses,
};

export type CheckSmashServerHealthResponse = boolean;
