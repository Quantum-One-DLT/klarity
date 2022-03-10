// @flow
import React, { Component, Fragment } from 'react';
import type { Node } from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import { get, includes, upperFirst } from 'lodash';
import { defineMessages, intlShape } from 'react-intl';
import CopyToClipboard from 'react-copy-to-clipboard';
import { PopOver } from 'react-polymorph/lib/components/PopOver';
import { Link } from 'react-polymorph/lib/components/Link';
import { LinkSkin } from 'react-polymorph/lib/skins/simple/LinkSkin';
import SVGInline from 'react-svg-inline';
import { ALLOWED_TIME_DIFFERENCE } from '../../config/timingConfig';
import globalMessages from '../../i18n/global-messages';
import DialogCloseButton from '../widgets/DialogCloseButton';
import closeCrossThin from '../../assets/images/close-cross-thin.inline.svg';
import iconCopy from '../../assets/images/clipboard-ic.inline.svg';
import sandClockIcon from '../../assets/images/sand-clock-xs.inline.svg';
import LocalizableError from '../../i18n/LocalizableError';
import {
  formattedNumber,
  formattedCpuModel,
  formattedSize,
} from '../../utils/formatters';
import { BccNodeStates } from '../../../../common/types/bcc-node.types';
import styles from './KlarityDiagnostics.scss';
import type { BccNodeState } from '../../../../common/types/bcc-node.types';
import type { SystemInfo } from '../../types/systemInfoTypes';
import type { CoreSystemInfo } from '../../types/coreSystemInfoTypes';
import type { TipInfo } from '../../api/network/types';

const messages = defineMessages({
  systemInfo: {
    id: 'klarity.diagnostics.dialog.system.info',
    defaultMessage: '!!!SYSTEM INFO',
    description: 'System info',
  },
  platform: {
    id: 'klarity.diagnostics.dialog.platform',
    defaultMessage: '!!!Platform',
    description: 'Platform',
  },
  platformVersion: {
    id: 'klarity.diagnostics.dialog.platform.version',
    defaultMessage: '!!!Platform version',
    description: 'Platform version',
  },
  cpu: {
    id: 'klarity.diagnostics.dialog.cpu',
    defaultMessage: '!!!CPU',
    description: 'CPU',
  },
  ram: {
    id: 'klarity.diagnostics.dialog.ram',
    defaultMessage: '!!!RAM',
    description: 'RAM',
  },
  availableDiskSpace: {
    id: 'klarity.diagnostics.dialog.availableDiskSpace',
    defaultMessage: '!!!Available disk space',
    description: 'Available disk space',
  },
  unknownDiskSpace: {
    id: 'klarity.diagnostics.dialog.unknownDiskSpace',
    defaultMessage: '!!!Unknown',
    description: 'Unknown amount of disk space',
  },
  unknownDiskSpaceSupportUrl: {
    id: 'klarity.diagnostics.dialog.unknownDiskSpaceSupportUrl',
    defaultMessage: '!!!https://tbco.zendesk.com/hc',
    description: '"Support" link URL while disk space is unknown',
  },
  coreInfo: {
    id: 'klarity.diagnostics.dialog.coreInfo',
    defaultMessage: '!!!CORE INFO',
    description: 'CORE INFO',
  },
  klarityVersion: {
    id: 'klarity.diagnostics.dialog.klarityVersion',
    defaultMessage: '!!!Klarity version',
    description: 'Klarity version',
  },
  klarityBuildNumber: {
    id: 'klarity.diagnostics.dialog.klarityBuildNumber',
    defaultMessage: '!!!Klarity build number',
    description: 'Klarity build number',
  },
  klarityMainProcessID: {
    id: 'klarity.diagnostics.dialog.klarityMainProcessID',
    defaultMessage: '!!!Klarity main process ID',
    description: 'Klarity main process ID',
  },
  klarityProcessID: {
    id: 'klarity.diagnostics.dialog.klarityProcessID',
    defaultMessage: '!!!Klarity renderer process ID',
    description: 'Klarity renderer process ID',
  },
  blankScreenFix: {
    id: 'klarity.diagnostics.dialog.blankScreenFix',
    defaultMessage: "!!!Klarity 'Blank Screen Fix' active",
    description: "Klarity 'Blank Screen Fix' active",
  },
  bccNodeVersion: {
    id: 'klarity.diagnostics.dialog.bccNodeVersion',
    defaultMessage: '!!!Bcc node version',
    description: 'Bcc node version',
  },
  bccNodePID: {
    id: 'klarity.diagnostics.dialog.bccNodePID',
    defaultMessage: '!!!Bcc node process ID',
    description: 'Bcc node process ID',
  },
  bccNodeApiPort: {
    id: 'klarity.diagnostics.dialog.bccNodeApiPort',
    defaultMessage: '!!!Bcc node port',
    description: 'Bcc node port',
  },
  bccWalletPID: {
    id: 'klarity.diagnostics.dialog.bccWalletPID',
    defaultMessage: '!!!Bcc wallet process ID',
    description: 'Bcc wallet process ID',
  },
  bccWalletVersion: {
    id: 'klarity.diagnostics.dialog.bccWalletVersion',
    defaultMessage: '!!!Bcc wallet version',
    description: 'Bcc wallet version',
  },
  bccWalletApiPort: {
    id: 'klarity.diagnostics.dialog.bccWalletApiPort',
    defaultMessage: '!!!Bcc wallet port',
    description: 'Bcc wallet port',
  },
  bccNetwork: {
    id: 'klarity.diagnostics.dialog.bccNetwork',
    defaultMessage: '!!!Bcc network',
    description: 'Bcc network',
  },
  stateDirectoryPath: {
    id: 'klarity.diagnostics.dialog.stateDirectory',
    defaultMessage: '!!!Klarity state directory',
    description: 'Klarity state directory',
  },
  stateDirectoryPathOpenBtn: {
    id: 'klarity.diagnostics.dialog.stateDirectoryPathOpenBtn',
    defaultMessage: '!!!Open',
    description: 'Open',
  },
  connectionError: {
    id: 'klarity.diagnostics.dialog.connectionError',
    defaultMessage: '!!!CONNECTION ERROR',
    description: 'CONNECTION ERROR',
  },
  klarityStatus: {
    id: 'klarity.diagnostics.dialog.klarityStatus',
    defaultMessage: '!!!KLARITY STATUS',
    description: 'KLARITY STATUS',
  },
  connected: {
    id: 'klarity.diagnostics.dialog.connected',
    defaultMessage: '!!!Connected',
    description: 'Connected',
  },
  synced: {
    id: 'klarity.diagnostics.dialog.synced',
    defaultMessage: '!!!Synced',
    description: 'Synced',
  },
  syncPercentage: {
    id: 'klarity.diagnostics.dialog.syncPercentage',
    defaultMessage: '!!!Sync percentage',
    description: 'Sync percentage',
  },
  localTimeDifference: {
    id: 'klarity.diagnostics.dialog.localTimeDifference',
    defaultMessage: '!!!Local time difference',
    description: 'Local time difference',
  },
  systemTimeCorrect: {
    id: 'klarity.diagnostics.dialog.systemTimeCorrect',
    defaultMessage: '!!!System time correct',
    description: 'System time correct',
  },
  systemTimeIgnored: {
    id: 'klarity.diagnostics.dialog.systemTimeIgnored',
    defaultMessage: '!!!System time ignored',
    description: 'System time ignored',
  },
  checkingNodeTime: {
    id: 'klarity.diagnostics.dialog.checkingNodeTime',
    defaultMessage: '!!!Checking system time',
    description: 'Checking system time',
  },
  bccNodeStatus: {
    id: 'klarity.diagnostics.dialog.bccNodeStatus',
    defaultMessage: '!!!BCC NODE STATUS',
    description: 'BCC NODE STATUS',
  },
  bccNodeStatusRestarting: {
    id: 'klarity.diagnostics.dialog.bccNodeStatusRestarting',
    defaultMessage: '!!!Restarting Bcc node...',
    description: 'Restarting Bcc node...',
  },
  bccNodeStatusRestart: {
    id: 'klarity.diagnostics.dialog.bccNodeStatusRestart',
    defaultMessage: '!!!Restart Bcc node',
    description: 'Restart Bcc node',
  },
  bccNodeState: {
    id: 'klarity.diagnostics.dialog.bccNodeState',
    defaultMessage: '!!!Bcc node state',
    description: 'Bcc node state',
  },
  nodeHasBeenUpdated: {
    id: 'klarity.diagnostics.dialog.nodeHasBeenUpdated',
    defaultMessage: '!!!Updated',
    description: 'Updated',
  },
  nodeHasCrashed: {
    id: 'klarity.diagnostics.dialog.nodeHasCrashed',
    defaultMessage: '!!!Crashed',
    description: 'Crashed',
  },
  nodeHasErrored: {
    id: 'klarity.diagnostics.dialog.nodeHasErrored',
    defaultMessage: '!!!Errored',
    description: 'Errored',
  },
  nodeHasStopped: {
    id: 'klarity.diagnostics.dialog.nodeHasStopped',
    defaultMessage: '!!!Stopped',
    description: 'Stopped',
  },
  nodeIsExiting: {
    id: 'klarity.diagnostics.dialog.nodeIsExiting',
    defaultMessage: '!!!Exiting',
    description: 'Exiting',
  },
  nodeIsRunning: {
    id: 'klarity.diagnostics.dialog.nodeIsRunning',
    defaultMessage: '!!!Running',
    description: 'Running',
  },
  nodeIsStarting: {
    id: 'klarity.diagnostics.dialog.nodeIsStarting',
    defaultMessage: '!!!Starting',
    description: 'Starting',
  },
  nodeIsStopping: {
    id: 'klarity.diagnostics.dialog.nodeIsStopping',
    defaultMessage: '!!!Stopping',
    description: 'Stopping',
  },
  nodeIsUnrecoverable: {
    id: 'klarity.diagnostics.dialog.nodeIsUnrecoverable',
    defaultMessage: '!!!Unrecoverable',
    description: 'Unrecoverable',
  },
  nodeIsUpdating: {
    id: 'klarity.diagnostics.dialog.nodeIsUpdating',
    defaultMessage: '!!!Updating',
    description: 'Updating',
  },
  bccNodeResponding: {
    id: 'klarity.diagnostics.dialog.bccNodeResponding',
    defaultMessage: '!!!Bcc node responding',
    description: 'Bcc node responding',
  },
  bccNodeSubscribed: {
    id: 'klarity.diagnostics.dialog.bccNodeSubscribed',
    defaultMessage: '!!!Bcc node subscribed',
    description: 'Bcc node subscribed',
  },
  bccNodeTimeCorrect: {
    id: 'klarity.diagnostics.dialog.bccNodeTimeCorrect',
    defaultMessage: '!!!Bcc node time correct',
    description: 'Bcc node time correct',
  },
  bccNodeSyncing: {
    id: 'klarity.diagnostics.dialog.bccNodeSyncing',
    defaultMessage: '!!!Bcc node syncing',
    description: 'Bcc node syncing',
  },
  bccNodeInSync: {
    id: 'klarity.diagnostics.dialog.bccNodeInSync',
    defaultMessage: '!!!Bcc node in sync',
    description: 'Bcc node in sync',
  },
  localTimeDifferenceChecking: {
    id: 'klarity.diagnostics.dialog.localTimeDifferenceChecking',
    defaultMessage: '!!!Checking...',
    description: 'Checking...',
  },
  localTimeDifferenceCheckTime: {
    id: 'klarity.diagnostics.dialog.localTimeDifferenceCheckTime',
    defaultMessage: '!!!Check time',
    description: 'Check time',
  },
  statusOn: {
    id: 'klarity.diagnostics.dialog.statusOn',
    defaultMessage: '!!!YES',
    description: 'YES',
  },
  statusOff: {
    id: 'klarity.diagnostics.dialog.statusOff',
    defaultMessage: '!!!NO',
    description: 'NO',
  },
  serviceUnreachable: {
    id: 'klarity.diagnostics.dialog.serviceUnreachable',
    defaultMessage: '!!!NTP service unreachable',
    description: 'NTP service unreachable',
  },
  message: {
    id: 'klarity.diagnostics.dialog.message',
    defaultMessage: '!!!message',
    description: 'message',
  },
  code: {
    id: 'klarity.diagnostics.dialog.code',
    defaultMessage: '!!!code',
    description: 'code',
  },
  lastNetworkBlock: {
    id: 'klarity.diagnostics.dialog.lastNetworkBlock',
    defaultMessage: '!!!Last network block',
    description: 'Last network block',
  },
  lastSynchronizedBlock: {
    id: 'klarity.diagnostics.dialog.lastSynchronizedBlock',
    defaultMessage: '!!!Last synchronized block',
    description: 'Last synchronized block',
  },
  epoch: {
    id: 'klarity.diagnostics.dialog.epoch',
    defaultMessage: '!!!epoch',
    description: 'epoch',
  },
  slot: {
    id: 'klarity.diagnostics.dialog.slot',
    defaultMessage: '!!!slot',
    description: 'slot',
  },
});

type Props = {
  systemInfo: SystemInfo,
  coreInfo: CoreSystemInfo,
  bccNodeState: ?BccNodeState,
  isNodeResponding: boolean,
  // isNodeSubscribed: boolean,
  isNodeSyncing: boolean,
  isNodeInSync: boolean,
  isNodeTimeCorrect: boolean,
  nodeConnectionError: ?LocalizableError,
  isConnected: boolean,
  isSynced: boolean,
  syncPercentage: number,
  localTimeDifference: ?number,
  isSystemTimeCorrect: boolean,
  isSystemTimeIgnored: boolean,
  isCheckingSystemTime: boolean,
  isForceCheckingSystemTime: boolean,
  localTip: ?TipInfo,
  networkTip: ?TipInfo,
  onOpenStateDirectory: Function,
  onOpenExternalLink: Function,
  onRestartNode: Function,
  onClose: Function,
  onCopyStateDirectoryPath: Function,
  onForceCheckNetworkClock: Function,
};

type State = {
  isNodeRestarting: boolean,
};

const FINAL_BCC_NODE_STATES = [
  BccNodeStates.RUNNING,
  BccNodeStates.UPDATED,
  BccNodeStates.CRASHED,
  BccNodeStates.ERRORED,
  BccNodeStates.UNRECOVERABLE,
];

@observer
export default class KlarityDiagnostics extends Component<Props, State> {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      isNodeRestarting: false,
    };
  }

  componentDidUpdate(prevProps: Props) {
    const { bccNodeState: prevBccNodeState } = prevProps;
    const { bccNodeState } = this.props;

    if (
      bccNodeState !== prevBccNodeState &&
      includes(FINAL_BCC_NODE_STATES, bccNodeState)
    ) {
      this.setState({ isNodeRestarting: false }); // eslint-disable-line
    }
  }

  getSectionRow = (messageId: string, content?: Node) => {
    return (
      <div className={styles.layoutRow}>
        <div className={styles.sectionTitle}>
          <span>{this.context.intl.formatMessage(messages[messageId])}</span>
          {content}
          <hr />
        </div>
      </div>
    );
  };

  getRow = (messageId: string, value: Node | boolean) => {
    const { intl } = this.context;
    const key = intl.formatMessage(messages[messageId]);
    const colon = intl.formatMessage(globalMessages.punctuationColon);
    let content = value;
    let className = classNames([styles[messageId], styles.layoutData]);
    const classNameHeader = classNames([
      styles[messageId],
      styles.layoutHeader,
    ]);
    const classNameRow = classNames([styles.layoutRow, messageId]);
    if (typeof value === 'boolean') {
      content = value
        ? intl.formatMessage(messages.statusOn)
        : intl.formatMessage(messages.statusOff);
      className =
        (value && messageId !== 'systemTimeIgnored') ||
        (!value && messageId === 'systemTimeIgnored')
          ? classNames([className, styles.green])
          : classNames([className, styles.red]);
    }
    return (
      <div className={classNameRow}>
        <div className={classNameHeader}>
          {key}
          {colon}
        </div>
        <div className={className}>{content}</div>
      </div>
    );
  };

  render() {
    const { intl } = this.context;

    const {
      systemInfo,
      coreInfo,
      bccNodeState,
      isNodeResponding,
      // isNodeSubscribed,
      isNodeSyncing,
      isNodeInSync,
      isNodeTimeCorrect,
      isConnected,
      isSynced,
      syncPercentage,
      localTimeDifference,
      isSystemTimeCorrect,
      isSystemTimeIgnored,
      localTip,
      networkTip,
      onOpenStateDirectory,
      onClose,
      onCopyStateDirectoryPath,
      nodeConnectionError,
      onOpenExternalLink,
      isCheckingSystemTime,
      isForceCheckingSystemTime,
    } = this.props;

    const {
      platform,
      platformVersion,
      cpu: cpuInOriginalFormat,
      ram,
      availableDiskSpace: availableDiskSpaceInOriginalFormat,
    } = systemInfo;

    const cpu = formattedCpuModel(cpuInOriginalFormat);
    const availableDiskSpace = formattedSize(
      availableDiskSpaceInOriginalFormat
    );

    const {
      klarityVersion,
      klarityBuildNumber,
      klarityProcessID,
      klarityMainProcessID,
      isBlankScreenFixActive,
      bccNodeVersion,
      bccNodePID,
      bccWalletVersion,
      bccWalletPID,
      bccWalletApiPort,
      bccNetwork,
      klarityStateDirectoryPath,
    } = coreInfo;

    const { isNodeRestarting } = this.state;
    const isNTPServiceReachable = localTimeDifference != null;
    const connectionError = get(nodeConnectionError, 'values', '{}');
    const { message, code } = connectionError;

    const unknownDiskSpaceSupportUrl = intl.formatMessage(
      messages.unknownDiskSpaceSupportUrl
    );

    const bccNetworkValue = intl.formatMessage(
      globalMessages[`network_${bccNetwork}`]
    );

    const localTimeDifferenceClasses = isCheckingSystemTime
      ? classNames([styles.layoutData, styles.localTimeDifference])
      : classNames([
          styles.layoutData,
          styles.localTimeDifference,
          !isNTPServiceReachable ||
          (localTimeDifference &&
            Math.abs(localTimeDifference) > ALLOWED_TIME_DIFFERENCE)
            ? styles.red
            : styles.green,
        ]);

    const { getSectionRow, getRow } = this;

    return (
      <div className={styles.component}>
        <DialogCloseButton
          className={styles.closeButton}
          icon={closeCrossThin}
          onClose={onClose}
        />

        <div className={styles.tables}>
          <div className={styles.table}>
            <div>
              {getSectionRow('bccNodeStatus')}
              {getRow('platform', platform)}
              {getRow('platformVersion', platformVersion)}
              {getRow('cpu', <PopOver content={cpu}>{cpu}</PopOver>)}
              {getRow('ram', ram)}
              {getRow(
                'availableDiskSpace',
                availableDiskSpace || (
                  <Link
                    onClick={() =>
                      onOpenExternalLink(unknownDiskSpaceSupportUrl)
                    }
                    label={intl.formatMessage(messages.unknownDiskSpace)}
                    skin={LinkSkin}
                  />
                )
              )}
            </div>
            <div>
              {getSectionRow('coreInfo')}
              {getRow('klarityVersion', klarityVersion)}
              {getRow('klarityBuildNumber', klarityBuildNumber)}
              {getRow('klarityMainProcessID', klarityMainProcessID)}
              {getRow('klarityProcessID', klarityProcessID)}
              {getRow(
                'blankScreenFix',
                isBlankScreenFixActive
                  ? intl.formatMessage(messages.statusOn)
                  : intl.formatMessage(messages.statusOff)
              )}
              {getRow(
                'stateDirectoryPath',
                <Fragment>
                  <button
                    className={styles.stateDirectoryOpenBtn}
                    onClick={() =>
                      onOpenStateDirectory(klarityStateDirectoryPath)
                    }
                  >
                    {intl.formatMessage(messages.stateDirectoryPathOpenBtn)}
                  </button>
                  <CopyToClipboard
                    text={klarityStateDirectoryPath}
                    onCopy={onCopyStateDirectoryPath}
                  >
                    <div className={styles.stateDirectoryPath}>
                      <PopOver
                        maxWidth={400}
                        content={
                          <div className={styles.tooltipLabelWrapper}>
                            <div>{klarityStateDirectoryPath}</div>
                          </div>
                        }
                      >
                        <div className={styles.klarityStateDirectoryPath}>
                          {klarityStateDirectoryPath}
                        </div>
                        <SVGInline svg={iconCopy} />
                      </PopOver>
                    </div>
                  </CopyToClipboard>
                </Fragment>
              )}
              {getRow('bccNodeVersion', bccNodeVersion)}
              {getRow('bccNodePID', bccNodePID || '-')}
              {/* getRow('bccNodeApiPort', '-') */}
              {getRow('bccWalletVersion', bccWalletVersion)}
              {getRow('bccWalletPID', bccWalletPID || '-')}
              {getRow('bccWalletApiPort', bccWalletApiPort || '-')}
            </div>
            {isConnected && nodeConnectionError ? (
              <div>
                {getSectionRow('connectionError')}
                <div className={styles.layoutRow}>
                  <div className={styles.layoutHeader}>
                    <div className={styles.error}>
                      {intl.formatMessage(messages.message)}: {message || '-'}
                      <br />
                      {intl.formatMessage(messages.code)}: {code || '-'}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className={styles.table}>
            <div>
              {getSectionRow('klarityStatus')}
              {getRow('bccNetwork', bccNetworkValue)}
              {getRow('connected', isConnected)}
              {getRow('synced', isSynced)}
              {getRow(
                'syncPercentage',
                `${formattedNumber(syncPercentage, 2)}%`
              )}
              {getRow(
                'lastNetworkBlock',
                <Fragment>
                  <span>{intl.formatMessage(messages.epoch)}:</span>{' '}
                  {networkTip && networkTip.epoch ? (
                    formattedNumber(networkTip.epoch)
                  ) : (
                    <SVGInline
                      svg={sandClockIcon}
                      className={styles.networkTipSandClock}
                    />
                  )}
                  <span>{intl.formatMessage(messages.slot)}:</span>{' '}
                  {networkTip && networkTip.slot ? (
                    formattedNumber(networkTip.slot)
                  ) : (
                    <SVGInline
                      svg={sandClockIcon}
                      className={styles.networkTipSandClock}
                    />
                  )}
                </Fragment>
              )}
              {getRow(
                'lastSynchronizedBlock',
                <Fragment>
                  <span>{intl.formatMessage(messages.epoch)}:</span>{' '}
                  {localTip && localTip.epoch ? (
                    formattedNumber(localTip.epoch)
                  ) : (
                    <SVGInline
                      svg={sandClockIcon}
                      className={styles.networkTipSandClock}
                    />
                  )}
                  <span>{intl.formatMessage(messages.slot)}:</span>{' '}
                  {localTip && localTip.slot ? (
                    formattedNumber(localTip.slot)
                  ) : (
                    <SVGInline
                      svg={sandClockIcon}
                      className={styles.networkTipSandClock}
                    />
                  )}
                </Fragment>
              )}
              <div className={styles.layoutRow}>
                <div className={styles.layoutHeader}>
                  {intl.formatMessage(messages.localTimeDifference)}
                  {intl.formatMessage(globalMessages.punctuationColon)}
                </div>
                <div className={localTimeDifferenceClasses}>
                  {
                    <button
                      onClick={() => this.checkTime()}
                      disabled={isForceCheckingSystemTime || !isNodeResponding}
                    >
                      {isForceCheckingSystemTime
                        ? intl.formatMessage(
                            messages.localTimeDifferenceChecking
                          )
                        : intl.formatMessage(
                            messages.localTimeDifferenceCheckTime
                          )}
                    </button>
                  }
                  {isCheckingSystemTime ? (
                    <span className={localTimeDifferenceClasses}>
                      <SVGInline
                        svg={sandClockIcon}
                        className={styles.networkTipSandClock}
                      />
                    </span>
                  ) : (
                    <span className={localTimeDifferenceClasses}>
                      {isNTPServiceReachable
                        ? `${formattedNumber(localTimeDifference || 0)} μs`
                        : intl.formatMessage(messages.serviceUnreachable)}
                    </span>
                  )}
                </div>
              </div>
              {getRow('systemTimeCorrect', isSystemTimeCorrect)}
              {getRow('systemTimeIgnored', isSystemTimeIgnored)}
              {
                <div className={styles.layoutRow}>
                  <div className={styles.layoutHeader}>
                    {intl.formatMessage(messages.checkingNodeTime)}
                    {intl.formatMessage(globalMessages.punctuationColon)}
                  </div>
                  <div className={styles.layoutData}>
                    {isCheckingSystemTime
                      ? intl.formatMessage(messages.statusOn)
                      : intl.formatMessage(messages.statusOff)}
                  </div>
                </div>
              }
            </div>
            <div>
              {getSectionRow(
                'bccNodeStatus',
                <button
                  className={styles.bccNodeStatusBtn}
                  onClick={() => this.restartNode()}
                  disabled={
                    !includes(FINAL_BCC_NODE_STATES, bccNodeState)
                  }
                >
                  {isNodeRestarting
                    ? intl.formatMessage(messages.bccNodeStatusRestarting)
                    : intl.formatMessage(messages.bccNodeStatusRestart)}
                </button>
              )}
              {getRow(
                'bccNodeState',
                upperFirst(
                  bccNodeState != null
                    ? intl.formatMessage(
                        this.getLocalisationForBccNodeState()
                      )
                    : 'unknown'
                )
              )}
              {getRow('bccNodeResponding', isNodeResponding)}
              {/* getRow('bccNodeSubscribed', isNodeSubscribed) */}
              {getRow('bccNodeTimeCorrect', isNodeTimeCorrect)}
              {getRow('bccNodeSyncing', isNodeSyncing)}
              {getRow('bccNodeInSync', isNodeInSync)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  getLocalisationForBccNodeState = () => {
    const { bccNodeState } = this.props;
    let localisationKey;
    switch (bccNodeState) {
      case BccNodeStates.STARTING:
        localisationKey = messages.nodeIsStarting;
        break;
      case BccNodeStates.EXITING:
        localisationKey = messages.nodeIsExiting;
        break;
      case BccNodeStates.STOPPING:
        localisationKey = messages.nodeIsStopping;
        break;
      case BccNodeStates.STOPPED:
        localisationKey = messages.nodeHasStopped;
        break;
      case BccNodeStates.UPDATING:
        localisationKey = messages.nodeIsUpdating;
        break;
      case BccNodeStates.UPDATED:
        localisationKey = messages.nodeHasBeenUpdated;
        break;
      case BccNodeStates.CRASHED:
        localisationKey = messages.nodeHasCrashed;
        break;
      case BccNodeStates.ERRORED:
        localisationKey = messages.nodeHasErrored;
        break;
      case BccNodeStates.UNRECOVERABLE:
        localisationKey = messages.nodeIsUnrecoverable;
        break;
      default:
        localisationKey = messages.nodeIsRunning;
        break;
    }
    return localisationKey;
  };

  restoreDialogCloseOnEscKey = () => {
    // This method is to be used on buttons which get disabled after click
    // as without it the ReactModal is not closing if you press the ESC key
    // even after the button is later re-enabled
    document.getElementsByClassName('ReactModal__Content')[0].focus();
  };

  checkTime = () => {
    this.props.onForceCheckNetworkClock();
    this.restoreDialogCloseOnEscKey();
  };

  restartNode = () => {
    this.setState({ isNodeRestarting: true });
    this.props.onRestartNode.trigger();
    this.restoreDialogCloseOnEscKey();
  };
}
