// @flow
import React from 'react';
import classnames from 'classnames';
import { intlShape, injectIntl } from 'react-intl';
import { PopOver } from 'react-polymorph/lib/components/PopOver';
import BigNumber from 'bignumber.js';
import { observer } from 'mobx-react';
import styles from './AssetsTransactionConfirmation.scss';
import AssetTransactionConfirmation from './AssetTransactionConfirmation';
import Wallet from '../../domains/Wallet';
import globalMessages from '../../i18n/global-messages';
import { formattedWalletAmount } from '../../utils/formatters';
import type { AssetToken } from '../../api/assets/types';
import { isTokenMissingInWallet, tokenHasBalance } from '../../utils/assets';

type Props = {
  assets: Array<AssetToken>,
  assetsAmounts: Array<BigNumber>,
  className?: string,
  bccAmount?: BigNumber,
  intl: intlShape.isRequired,
  wallet?: ?Wallet,
  getAssetByUniqueId: Function,
  bccError?: string,
};

const AssetsTransactionConfirmation = observer((props: Props) => {
  const {
    bccAmount,
    assets,
    assetsAmounts,
    className,
    intl,
    wallet,
    bccError,
  } = props;
  const insufficientBccAmount = wallet?.amount.isLessThan(bccAmount);
  const componentStyles = classnames([styles.component, className]);
  const bccAmountStyles = classnames([
    styles.bccAmount,
    insufficientBccAmount ? styles.bccAmountError : null,
  ]);
  const bccAmountContent = (
    <div className={bccAmountStyles}>
      <p>{intl.formatMessage(globalMessages.bccName)}</p>
      <div className={styles.amount}>{formattedWalletAmount(bccAmount)}</div>
    </div>
  );

  return (
    <div className={componentStyles}>
      {bccError ? (
        <PopOver
          content={bccError}
          className={styles.bccErrorPopOver}
          appendTo="parent"
        >
          {bccAmountContent}
        </PopOver>
      ) : (
        bccAmountContent
      )}
      {assets.map((asset, index) => (
        <AssetTransactionConfirmation
          key={asset.uniqueId}
          assetNumber={index + 1}
          isHardwareWallet={false}
          asset={asset}
          amount={assetsAmounts[index]}
          tokenIsMissing={isTokenMissingInWallet(wallet, asset)}
          insufficientBalance={
            !!wallet && !tokenHasBalance(asset, assetsAmounts[index])
          }
        />
      ))}
    </div>
  );
});

export default injectIntl(AssetsTransactionConfirmation);
