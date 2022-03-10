// @flow
import React, { Component } from 'react';
import { defineMessages, intlShape, FormattedHTMLMessage } from 'react-intl';
import SVGInline from 'react-svg-inline';
import { PopOver } from 'react-polymorph/lib/components/PopOver';
import classNames from 'classnames';
import styles from './StatusIcons.scss';
import { BccNodeStates } from '../../../../../common/types/bcc-node.types';
import nodeStateIcon from '../../../assets/images/node-state-icon.inline.svg';
import isNodeRespondingIcon from '../../../assets/images/is-node-responding-icon.inline.svg';
// import isNodeSubscribedIcon from '../../../assets/images/is-node-subscribed-icon.inline.svg';
import isNodeTimeCorrectIcon from '../../../assets/images/is-node-time-correct-icon.inline.svg';
import isNodeSyncingIcon from '../../../assets/images/is-node-syncing-icon.inline.svg';
import type { BccNodeState } from '../../../../../common/types/bcc-node.types';

const messages = defineMessages({
  nodeIsRunning: {
    id: 'status.icons.nodeIsRunning',
    defaultMessage: '!!!Bcc node is running!',
    description: 'Message "Bcc node is running" on the status icon tooltip',
  },
  nodeIsStarting: {
    id: 'status.icons.nodeIsStarting',
    defaultMessage: '!!!Bcc node is starting!',
    description: 'Message "Node is starting" on the status icon tooltip',
  },
  nodeIsExiting: {
    id: 'status.icons.nodeIsExiting',
    defaultMessage: '!!!Bcc node is exiting!',
    description: 'Message "Bcc node is exiting" on the status icon tooltip',
  },
  nodeIsStopping: {
    id: 'status.icons.nodeIsStopping',
    defaultMessage: '!!!Bcc node is stopping!',
    description:
      'Message "Bcc node is stopping" on the status icon tooltip',
  },
  nodeHasStopped: {
    id: 'status.icons.nodeHasStopped',
    defaultMessage: '!!!Bcc node has stopped!',
    description:
      'Message "Bcc node has stopped" on the status icon tooltip',
  },
  nodeIsUpdating: {
    id: 'status.icons.nodeIsUpdating',
    defaultMessage: '!!!Bcc node is updating!',
    description:
      'Message "Bcc node is updating" on the status icon tooltip',
  },
  nodeHasBeenUpdated: {
    id: 'status.icons.nodeHasBeenUpdated',
    defaultMessage: '!!!Bcc node has been updated!',
    description:
      'Message "Bcc node has been updated" on the status icon tooltip',
  },
  nodeHasCrashed: {
    id: 'status.icons.nodeHasCrashed',
    defaultMessage: '!!!Bcc node has crashed!',
    description:
      'Message "Bcc node has crashed" on the status icon tooltip',
  },
  nodeHasErrored: {
    id: 'status.icons.nodeHasErrored',
    defaultMessage: '!!!Bcc node has errored!',
    description:
      'Message "Bcc node has errored" on the status icon tooltip',
  },
  nodeIsUnrecoverable: {
    id: 'status.icons.nodeIsUnrecoverable',
    defaultMessage: '!!!Bcc node is unrecoverable!',
    description:
      'Message "Bcc node is unrecoverable" on the status icon tooltip',
  },
  checkYourInternetConnection: {
    id: 'status.icons.checkYourInternetConnection',
    defaultMessage: '!!!Check your Internet connection!',
    description:
      'Message "Check your Internet connection" on the status icon tooltip',
  },
  isNodeRespondingOn: {
    id: 'status.icons.isNodeRespondingOn',
    defaultMessage: '!!!Bcc node is responding!',
    description:
      'Message "Bcc node is responding" on the status icon tooltip',
  },
  isNodeRespondingOff: {
    id: 'status.icons.isNodeRespondingOff',
    defaultMessage: '!!!Bcc node is not responding!',
    description:
      'Message "Bcc node is not responding" on the status icon tooltip',
  },
  isNodeRespondingLoading: {
    id: 'status.icons.isNodeRespondingLoading',
    defaultMessage: '!!!Checking if Bcc node is responding!',
    description:
      'Message "Checking if Bcc node is responding" on the status icon tooltip',
  },
  isNodeSubscribedOn: {
    id: 'status.icons.isNodeSubscribedOn',
    defaultMessage: '!!!Bcc node is subscribed!',
    description:
      'Message "Bcc node is subscribed" on the status icon tooltip',
  },
  isNodeSubscribedOff: {
    id: 'status.icons.isNodeSubscribedOff',
    defaultMessage: '!!!Bcc node is not subscribed!',
    description:
      'Message "Bcc node is not subscribed" on the status icon tooltip',
  },
  isNodeSubscribedLoading: {
    id: 'status.icons.isNodeSubscribedLoading',
    defaultMessage: '!!!Checking if Bcc node is subscribed!',
    description:
      'Message "Checking if Bcc node is subscribed" on the status icon tooltip',
  },
  isNodeTimeCorrectOn: {
    id: 'status.icons.isNodeTimeCorrectOn',
    defaultMessage: '!!!Bcc node time is correct!',
    description:
      'Message "Bcc node time is correct" on the status icon tooltip',
  },
  isNodeTimeCorrectOff: {
    id: 'status.icons.isNodeTimeCorrectOff',
    defaultMessage: '!!!Bcc node time is not correct!',
    description:
      'Message "Bcc node time is not correct" on the status icon tooltip',
  },
  isNodeTimeCorrectLoading: {
    id: 'status.icons.isNodeTimeCorrectLoading',
    defaultMessage: '!!!Checking if Bcc node time is correct!',
    description:
      'Message "Checking if Bcc node time is correct" on the status icon tooltip',
  },
  isNodeSyncingOn: {
    id: 'status.icons.isNodeSyncingOn',
    defaultMessage: '!!!Bcc node is syncing!',
    description: 'Message "Bcc node is syncing" on the status icon tooltip',
  },
  isNodeSyncingOff: {
    id: 'status.icons.isNodeSyncingOff',
    defaultMessage: '!!!Bcc node is not syncing!',
    description:
      'Message "Bcc node is not syncing" on the status icon tooltip',
  },
  isNodeSyncingLoading: {
    id: 'status.icons.isNodeSyncingLoading',
    defaultMessage: '!!!Checking if Bcc node is syncing!',
    description:
      'Message "Checking if Bcc node is syncing" on the status icon tooltip',
  },
});

type Props = {
  onIconClick: Function,
  nodeState: ?BccNodeState,
  isNodeResponding?: boolean,
  isNodeSubscribed?: boolean,
  isNodeTimeCorrect?: boolean,
  isNodeSyncing?: boolean,
};

type TipParamValue = true | false | null | string;

const STATUS_CLASSNAMES: Object = {
  [BccNodeStates.STARTING]: 'unloaded',
  [BccNodeStates.RUNNING]: 'on',
  [BccNodeStates.EXITING]: 'unloaded',
  [BccNodeStates.STOPPING]: 'unloaded',
  [BccNodeStates.STOPPED]: 'unloaded',
  [BccNodeStates.UPDATING]: 'unloaded',
  [BccNodeStates.UPDATED]: 'unloaded',
  [BccNodeStates.CRASHED]: 'off',
  [BccNodeStates.ERRORED]: 'off',
  [BccNodeStates.UNRECOVERABLE]: 'off',
  true: 'on',
  false: 'off',
  undefined: 'unloaded',
};

const NODE_STATE_MESSAGES = {
  [BccNodeStates.RUNNING]: messages.nodeIsRunning,
  [BccNodeStates.STARTING]: messages.nodeIsStarting,
  [BccNodeStates.EXITING]: messages.nodeIsExiting,
  [BccNodeStates.STOPPING]: messages.nodeIsStopping,
  [BccNodeStates.STOPPED]: messages.nodeHasStopped,
  [BccNodeStates.UPDATING]: messages.nodeIsUpdating,
  [BccNodeStates.UPDATED]: messages.nodeHasBeenUpdated,
  [BccNodeStates.CRASHED]: messages.nodeHasCrashed,
  [BccNodeStates.ERRORED]: messages.nodeHasErrored,
  [BccNodeStates.UNRECOVERABLE]: messages.nodeIsUnrecoverable,
};

const VARIABLE_VALUES = {
  true: 'On',
  false: 'Off',
  undefined: 'Loading',
  null: 'IsStarting',
};

export default class StatusIcons extends Component<Props> {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  getTip = (paramName: string, paramValue: TipParamValue) => {
    let message;
    if (paramName === 'nodeState' && paramValue) {
      message = NODE_STATE_MESSAGES[String(paramValue)];
    } else {
      message = messages[`${paramName}${VARIABLE_VALUES[String(paramValue)]}`];
    }
    return message && <FormattedHTMLMessage {...message} />;
  };

  getClassName = (paramName: string) => {
    // If node is not running, it displays the icons with opacity
    // Whether {isNodeSyncing} it displays the icons for syncing or loading screen
    const { isNodeSyncing } = this.props;
    const paramValue = this.props[paramName];
    let status = STATUS_CLASSNAMES[paramValue];
    if (this.isDisabled(paramName)) {
      status = 'unknown';
    }
    return classNames([
      styles.icon,
      styles[`icon-${status}`],
      styles[`icon-${paramName}`],
      isNodeSyncing ? styles.syncing : styles.loading,
    ]);
  };

  getTooltipClassname = (paramName: string) => {
    const paramValue = this.props[paramName];
    return classNames([
      styles.tooltip,
      typeof paramValue === 'undefined' ? styles.ellipsis : null,
      this.isDisabled(paramName) ? styles.disabled : null,
    ]);
  };

  isDisabled = (paramName: string) =>
    paramName !== 'nodeState' &&
    this.props.nodeState !== BccNodeStates.RUNNING;

  getIconWithPopover = (icon: string, paramName: string) => (
    <PopOver
      themeVariables={{
        '--rp-pop-over-bg-color':
          'var(--theme-loading-status-icons-tooltip-color)',
        '--rp-pop-over-border-radius': '5px',
        '--rp-bubble-padding': '6px 12px 7px',
      }}
      contentClassName={this.getTooltipClassname(paramName)}
      key={paramName}
      content={this.getTip(paramName, this.props[paramName])}
    >
      <button className={styles.iconButton} onClick={this.props.onIconClick}>
        <SVGInline svg={icon} className={this.getClassName(paramName)} />
      </button>
    </PopOver>
  );

  render() {
    return (
      <div className={styles.component}>
        {[
          this.getIconWithPopover(nodeStateIcon, 'nodeState'),
          this.getIconWithPopover(isNodeRespondingIcon, 'isNodeResponding'),
          // this.getIconWithPopover(isNodeSubscribedIcon, 'isNodeSubscribed'),
          this.getIconWithPopover(isNodeTimeCorrectIcon, 'isNodeTimeCorrect'),
          this.getIconWithPopover(isNodeSyncingIcon, 'isNodeSyncing'),
        ]}
      </div>
    );
  }
}
