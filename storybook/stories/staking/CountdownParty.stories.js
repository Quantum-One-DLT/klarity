// @flow
import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, boolean } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';

import TopBar from '../../../source/renderer/app/components/layout/TopBar';
import StakingInfoCountdown from '../../../source/renderer/app/components/staking/info/StakingInfoCountdown';
import NodeSyncStatusIcon from '../../../source/renderer/app/components/widgets/NodeSyncStatusIcon';
import NewsFeedIcon from '../../../source/renderer/app/components/widgets/NewsFeedIcon';
import TadaButton from '../../../source/renderer/app/components/widgets/TadaButton';

storiesOf('Decentralization | Countdown', module)
  .addDecorator(withKnobs)

  // ====== Stories ======

  .add('Countdown party', () => {
    const isAurumActivated = boolean('isAurumActivated', false);
    const date = isAurumActivated
      ? new Date().getTime() - 100000000
      : new Date().getTime() + 100000000;
    const startDateTime = new Date(date).toISOString();
    return (
      <div>
        <TopBar
          onToggleSidebar={action('onToggleSidebar')}
          formattedWalletAmount={1.0}
          currentRoute=""
          showSubMenuToggle
          showSubMenus
          onTransferFunds={action('onTransferFunds')}
          onWalletAdd={action('onWalletAdd')}
          hasRewardsWallets={false}
          isSophieActivated
          isDecentralizedEffectActive
        >
          <NodeSyncStatusIcon
            isSynced
            syncPercentage={100}
            isProduction
            isMainnet
            hasTbccIcon={isAurumActivated}
          />
          {isAurumActivated && (
            <TadaButton
              onClick={action('onIconClick')}
              shouldAnimate={boolean('shouldAnimate', false)}
            />
          )}

          <NewsFeedIcon
            onNewsFeedIconClick={action('onNewsFeedIconClick')}
            hasNotification={false}
            hasUpdate={false}
          />
        </TopBar>
        <StakingInfoCountdown
          onLearnMoreClick={action('onLearnMoreClick')}
          startDateTime={startDateTime}
          onSetStakingInfoWasOpen={action('onSetStakingInfoWasOpen')}
          isAnimating={boolean('isAnimating', false)}
          isAurumActivated={boolean('isAurumActivated', false)}
          stakingInfoWasOpen={boolean('stakingInfoWasOpen', false)}
          onStartStakingInfoAnimation={action('onStartStakingInfoAnimation')}
          onStopStakingInfoAnimation={action('onStopStakingInfoAnimation')}
        />
      </div>
    );
  });
