// @flow
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import ReactModal from 'react-modal';
import KlarityDiagnostics from '../../components/status/KlarityDiagnostics';
import styles from './KlarityDiagnosticsDialog.scss';
import { formattedBytesToSize } from '../../utils/formatters';
import type { InjectedDialogContainerProps } from '../../types/injectedPropsType';

type Props = InjectedDialogContainerProps;

@inject('stores', 'actions')
@observer
export default class KlarityDiagnosticsDialog extends Component<Props> {
  static defaultProps = {
    actions: null,
    stores: null,
    children: null,
    onClose: () => {},
  };

  handleForceCheckNetworkClock = () =>
    this.props.actions.networkStatus.forceCheckNetworkClock.trigger();

  handleCopyStateDirectoryPath = () =>
    this.props.actions.networkStatus.copyStateDirectoryPath.trigger();

  render() {
    const { actions, stores } = this.props;
    const { closeKlarityDiagnosticsDialog } = actions.app;
    const { restartNode } = actions.networkStatus;
    const { app, networkStatus } = stores;
    const { openExternalLink } = app;
    const {
      // Node state
      bccNodeState,
      isNodeResponding,
      isNodeSyncing,
      isNodeInSync,
      isNodeTimeCorrect,
      // Application state
      isConnected,
      isSynced,
      syncPercentage,
      hasBeenConnected,
      localTimeDifference,
      isSystemTimeCorrect,
      isSystemTimeIgnored,
      openStateDirectory,
      getNetworkInfoRequest,
      networkTip,
      localTip,
      environment,
      diskSpaceAvailable,
      tlsConfig,
      bccNodePID,
      bccWalletPID,
      stateDirectoryPath,
      getNetworkClockRequest,
    } = networkStatus;

    const systemInfo = {
      platform: environment.os,
      platformVersion: environment.platformVersion,
      cpu: Array.isArray(environment.cpu) ? environment.cpu[0].model : '',
      ram: formattedBytesToSize(environment.ram),
      availableDiskSpace: diskSpaceAvailable,
    };

    const {
      network,
      version,
      rendererProcessID,
      mainProcessID,
      isBlankScreenFixActive,
      nodeVersion,
      apiVersion,
      build,
    } = environment;

    const coreInfo = {
      klarityVersion: version,
      klarityBuildNumber: build,
      klarityProcessID: rendererProcessID,
      klarityMainProcessID: mainProcessID,
      klarityStateDirectoryPath: stateDirectoryPath,
      isBlankScreenFixActive,
      bccNodeVersion: nodeVersion,
      bccNodePID,
      bccWalletVersion: apiVersion,
      bccWalletPID,
      bccWalletApiPort: tlsConfig ? tlsConfig.port : 0,
      bccNetwork: network,
    };

    return (
      <ReactModal
        isOpen
        closeOnOverlayClick
        onRequestClose={closeKlarityDiagnosticsDialog.trigger}
        className={styles.dialog}
        overlayClassName={styles.overlay}
        ariaHideApp={false}
      >
        <KlarityDiagnostics
          systemInfo={systemInfo}
          coreInfo={coreInfo}
          bccNodeState={bccNodeState}
          isDev={environment.isDev}
          isMainnet={environment.isMainnet}
          isStaging={environment.isStaging}
          isTestnet={environment.isTestnet}
          isNodeResponding={isNodeResponding}
          isNodeSyncing={isNodeSyncing}
          isNodeInSync={isNodeInSync}
          isNodeTimeCorrect={isNodeTimeCorrect}
          isConnected={isConnected}
          isSynced={isSynced}
          syncPercentage={syncPercentage}
          hasBeenConnected={hasBeenConnected}
          localTimeDifference={localTimeDifference}
          isSystemTimeCorrect={isSystemTimeCorrect}
          isSystemTimeIgnored={isSystemTimeIgnored}
          nodeConnectionError={getNetworkInfoRequest.error}
          localTip={localTip}
          networkTip={networkTip}
          isCheckingSystemTime={
            !getNetworkClockRequest.result || getNetworkClockRequest.isExecuting
          }
          isForceCheckingSystemTime={getNetworkClockRequest.isExecutingWithArgs(
            { isForceCheck: true }
          )}
          onOpenStateDirectory={openStateDirectory}
          onOpenExternalLink={openExternalLink}
          onRestartNode={restartNode}
          onClose={closeKlarityDiagnosticsDialog.trigger}
          onCopyStateDirectoryPath={this.handleCopyStateDirectoryPath}
          onForceCheckNetworkClock={this.handleForceCheckNetworkClock}
        />
      </ReactModal>
    );
  }
}
