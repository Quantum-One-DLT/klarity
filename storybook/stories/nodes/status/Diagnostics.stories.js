// @flow
import React from 'react';
import { storiesOf } from '@storybook/react';
import { number, withKnobs, boolean } from '@storybook/addon-knobs';

// Assets and helpers
import StoryDecorator from '../../_support/StoryDecorator';

// Screens
import KlarityDiagnostics from '../../../../source/renderer/app/components/status/KlarityDiagnostics';

const systemInfo = {
  platform: 'macOS',
  platformVersion: '17.7.0',
  cpu: 'Intel(R) Core(TM) i5-3210M CPU @ 2.50GHz',
  ram: '32.0 GB',
  availableDiskSpace: '500 GB',
};

const coreInfo = {
  klarityVersion: '0.14.0',
  klarityBuildNumber: '12500',
  klarityProcessID: '98954',
  klarityMainProcessID: '82734',
  isBlankScreenFixActive: false,
  bccNodeVersion: '1.10.1',
  bccNodePID: 87212,
  bccWalletVersion: '2020.4.7',
  bccWalletPID: 87213,
  bccWalletApiPort: 59982,
  bccNetwork: 'development',
  klarityStateDirectoryPath:
    '/Users/klarity/Library/Application Support/Klarity Demo',
};

storiesOf('Nodes|Status', module)
  .addDecorator((story) => <StoryDecorator>{story()}</StoryDecorator>)
  .addDecorator(withKnobs)

  // ====== Stories ======

  .add('Klarity Diagnostics', () => (
    <KlarityDiagnostics
      systemInfo={systemInfo}
      coreInfo={coreInfo}
      bccNodeState="running"
      isDev={false}
      isMainnet
      isStaging={false}
      isTestnet={false}
      isNodeResponding
      isNodeSubscribed
      isNodeSyncing
      isNodeInSync
      isNodeTimeCorrect
      isConnected
      isSynced
      syncPercentage={number('syncPercentage', 100)}
      hasBeenConnected
      localTimeDifference={number('localTimeDifference', 0)}
      isSystemTimeCorrect
      isForceCheckingNodeTime={false}
      isSystemTimeIgnored={false}
      latestLocalBlockTimestamp={number('latestLocalBlockTimestamp', 280719)}
      latestNetworkBlockTimestamp={number(
        'latestNetworkBlockTimestamp',
        280719
      )}
      nodeConnectionError={null}
      localTip={{ epoch: 123, slot: 13400, absoluteSlotNumber: 15000000 }}
      networkTip={{ epoch: 123, slot: 13400, absoluteSlotNumber: 15000000 }}
      localBlockHeight={number('localBlockHeight', 280719)}
      networkBlockHeight={number('networkBlockHeight', 42539)}
      isCheckingSystemTime={boolean('isCheckingSystemTime', true)}
      isForceCheckingSystemTime={boolean('isForceCheckingSystemTime', false)}
      onForceCheckNetworkClock={() => null}
      onCopyStateDirectoryPath={() => null}
      onOpenStateDirectory={() => null}
      onOpenExternalLink={() => null}
      onRestartNode={() => null}
      onClose={() => null}
    />
  ))
  .add('Klarity Diagnostics - without last network block info', () => (
    <KlarityDiagnostics
      systemInfo={systemInfo}
      coreInfo={coreInfo}
      bccNodeState="running"
      isDev={false}
      isMainnet
      isStaging={false}
      isTestnet={false}
      isNodeResponding
      isNodeSubscribed
      isNodeSyncing
      isNodeInSync
      isNodeTimeCorrect
      isConnected
      isSynced
      syncPercentage={number('syncPercentage', 100)}
      hasBeenConnected
      localTimeDifference={number('localTimeDifference', 0)}
      isSystemTimeCorrect
      isForceCheckingNodeTime={false}
      isSystemTimeIgnored={false}
      latestLocalBlockTimestamp={number('latestLocalBlockTimestamp', 280719)}
      latestNetworkBlockTimestamp={number(
        'latestNetworkBlockTimestamp',
        280719
      )}
      nodeConnectionError={null}
      localTip={{ epoch: 123, slot: 13400, absoluteSlotNumber: 15000000 }}
      networkTip={null}
      localBlockHeight={number('localBlockHeight', 280719)}
      networkBlockHeight={number('networkBlockHeight', 42539)}
      isCheckingSystemTime={boolean('isCheckingSystemTime', true)}
      isForceCheckingSystemTime={boolean('isForceCheckingSystemTime', false)}
      onForceCheckNetworkClock={() => null}
      onCopyStateDirectoryPath={() => null}
      onOpenStateDirectory={() => null}
      onOpenExternalLink={() => null}
      onRestartNode={() => null}
      onClose={() => null}
    />
  ));
