// @flow
import React, { Component } from 'react';
import { defineMessages, intlShape } from 'react-intl';
import classNames from 'classnames';
import styles from './SyncingConnectingStatus.scss';
import { BccNodeStates } from '../../../../../common/types/bcc-node.types';
import type { BccNodeState } from '../../../../../common/types/bcc-node.types';

const messages = defineMessages({
  starting: {
    id: 'loading.screen.startingBccMessage',
    defaultMessage: '!!!Starting Bcc node',
    description: 'Message "Starting Bcc node" on the loading screen.',
  },
  stopping: {
    id: 'loading.screen.stoppingBccMessage',
    defaultMessage: '!!!Stopping Bcc node',
    description: 'Message "Stopping Bcc node" on the loading screen.',
  },
  stopped: {
    id: 'loading.screen.stoppedBccMessage',
    defaultMessage: '!!!Bcc node stopped',
    description: 'Message "Bcc node stopped" on the loading screen.',
  },
  updating: {
    id: 'loading.screen.updatingBccMessage',
    defaultMessage: '!!!Updating Bcc node',
    description: 'Message "Updating Bcc node" on the loading screen.',
  },
  updated: {
    id: 'loading.screen.updatedBccMessage',
    defaultMessage: '!!!Bcc node updated',
    description: 'Message "Bcc node updated" on the loading screen.',
  },
  crashed: {
    id: 'loading.screen.crashedBccMessage',
    defaultMessage: '!!!Bcc node crashed',
    description: 'Message "Bcc node crashed" on the loading screen.',
  },
  unrecoverable: {
    id: 'loading.screen.unrecoverableBccMessage',
    defaultMessage:
      '!!!Unable to start Bcc node. Please submit a support request.',
    description:
      'Message "Unable to start Bcc node. Please submit a support request." on the loading screen.',
  },
  connecting: {
    id: 'loading.screen.connectingToNetworkMessage',
    defaultMessage: '!!!Connecting to network',
    description: 'Message "Connecting to network" on the loading screen.',
  },
  reconnecting: {
    id: 'loading.screen.reconnectingToNetworkMessage',
    defaultMessage: '!!!Network connection lost - reconnecting',
    description:
      'Message "Network connection lost - reconnecting" on the loading screen.',
  },
  loadingWalletData: {
    id: 'loading.screen.loadingWalletData',
    defaultMessage: '!!!Loading wallet data',
    description: 'Message "Loading wallet data" on the loading screen.',
  },
  tlsCertificateNotValidError: {
    id: 'loading.screen.errors.tlsCertificateNotValidPleaseRestartError',
    defaultMessage: '!!!TLS certificate is not valid, please restart Klarity.',
    description: 'The TLS cert is not valid and Klarity should be restarted',
  },
  verifyingBlockchain: {
    id: 'loading.screen.verifyingBlockchainMessage',
    defaultMessage:
      '!!!Verifying the blockchain ({verificationProgress}% complete)',
    description:
      'Message "Verifying the blockchain (65% complete) ..." on the loading screen.',
  },
});

type Props = {
  bccNodeState: ?BccNodeState,
  verificationProgress: number,
  hasLoadedCurrentLocale: boolean,
  hasBeenConnected: boolean,
  isTlsCertInvalid: boolean,
  isConnected: boolean,
  isNodeStopping: boolean,
  isNodeStopped: boolean,
  isVerifyingBlockchain: boolean,
};

export default class SyncingConnectingStatus extends Component<Props> {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  _getConnectingMessage = () => {
    const {
      bccNodeState,
      hasBeenConnected,
      isVerifyingBlockchain,
      isTlsCertInvalid,
      isConnected,
    } = this.props;
    if (isConnected) return messages.loadingWalletData;
    let connectingMessage;
    switch (bccNodeState) {
      case null:
      case BccNodeStates.STARTING:
        connectingMessage = messages.starting;
        break;
      case BccNodeStates.STOPPING:
      case BccNodeStates.EXITING:
        connectingMessage = messages.stopping;
        break;
      case BccNodeStates.STOPPED:
        connectingMessage = messages.stopped;
        break;
      case BccNodeStates.UPDATING:
        connectingMessage = messages.updating;
        break;
      case BccNodeStates.UPDATED:
        connectingMessage = messages.updated;
        break;
      case BccNodeStates.CRASHED:
      case BccNodeStates.ERRORED:
        connectingMessage = messages.crashed;
        break;
      case BccNodeStates.UNRECOVERABLE:
        connectingMessage = messages.unrecoverable;
        break;
      default:
        // also covers BccNodeStates.RUNNING state
        connectingMessage = hasBeenConnected
          ? messages.reconnecting
          : messages.connecting;
    }
    const isConnectingMessage =
      connectingMessage === messages.connecting ||
      connectingMessage === messages.reconnecting;
    if (isTlsCertInvalid && isConnectingMessage) {
      return messages.tlsCertificateNotValidError;
    }
    if (isVerifyingBlockchain && isConnectingMessage) {
      return messages.verifyingBlockchain;
    }
    return connectingMessage;
  };

  render() {
    const { intl } = this.context;
    const {
      isConnected,
      isNodeStopping,
      isNodeStopped,
      isTlsCertInvalid,
      hasLoadedCurrentLocale,
      verificationProgress,
    } = this.props;

    if (!hasLoadedCurrentLocale) return null;

    const showEllipsis =
      !isConnected && (isNodeStopped || (isTlsCertInvalid && !isNodeStopping));

    const componentStyles = classNames([
      styles.component,
      isConnected ? styles.syncing : styles.connecting,
    ]);

    const headlineStyles = classNames([
      styles.headline,
      showEllipsis ? styles.withoutAnimation : null,
    ]);

    return (
      <div className={componentStyles}>
        <h1 className={headlineStyles}>
          {intl.formatMessage(this._getConnectingMessage(), {
            verificationProgress,
          })}
        </h1>
      </div>
    );
  }
}
