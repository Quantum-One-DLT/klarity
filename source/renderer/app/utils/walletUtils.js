// @flow
import BigNumber from 'bignumber.js';
import Wallet from '../domains/Wallet';

// $FlowFixMe TODO: fix this in flowconfig
export default import('@tbco-jester/wallet-js').then((modules) => modules);

const MINIMUM_BCC_BALANCE_FOR_WITHDRAWING_REWARDS: number = 10; // 1 BCC | unit: BCC

export const isWalletRewardsWithdrawalPossible = (
  transactionAmount: BigNumber,
  walletBalance: BigNumber
): boolean =>
  !!transactionAmount &&
  !!walletBalance &&
  transactionAmount
    .plus(MINIMUM_BCC_BALANCE_FOR_WITHDRAWING_REWARDS)
    .isLessThanOrEqualTo(walletBalance);

// For more details check acceptance tests https://github.com/The-Blockchain-Company/klarity/pull/2617
export const shouldShowEmptyWalletWarning = (
  totalAmountToSpend: BigNumber,
  wallet: Wallet,
  hasAssets: boolean = false
): boolean => {
  const { amount: walletBalance, isLegacy, isDelegating } = wallet;
  const willRemainZeroBccAndZeroAssetsAndNotDelegating =
    !isDelegating &&
    walletBalance.minus(totalAmountToSpend).isZero() &&
    !hasAssets;

  if (willRemainZeroBccAndZeroAssetsAndNotDelegating) return false;

  return (
    !isLegacy &&
    !isWalletRewardsWithdrawalPossible(totalAmountToSpend, walletBalance)
  );
};
