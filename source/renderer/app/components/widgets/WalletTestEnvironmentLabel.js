// @flow
import React, { Component } from 'react';
import { defineMessages, intlShape } from 'react-intl';
import styles from './WalletTestEnvironmentLabel.scss';
import type { networkType } from '../../types/networkTypes';

const messages = defineMessages({
  flight: {
    id: 'test.environment.klarityFlightLabel',
    defaultMessage: '!!!Bcc mainnet - Klarity Flight',
    description: 'Label for Klarity Flight with version.',
  },
  testnet: {
    id: 'test.environment.testnetLabel',
    defaultMessage: '!!!Testnet vx',
    description: 'Label for testnet with version.',
  },
  staging: {
    id: 'test.environment.stagingLabel',
    defaultMessage: '!!!Staging vx',
    description: 'Label for staging network with version.',
  },
  sophie_qa: {
    id: 'test.environment.sophieQaLabel',
    defaultMessage: '!!!Sophie QA',
    description: 'Label for sophie_qa with version.',
  },
  aurum_purple: {
    id: 'test.environment.aurumPurpleLabel',
    defaultMessage: '!!!Aurum Purple',
    description: 'Label for aurum_purple with version.',
  },
  selfnode: {
    id: 'test.environment.selfnodeLabel',
    defaultMessage: '!!!Selfnode vx',
    description: 'Label for selfnode with version.',
  },
  development: {
    id: 'test.environment.developmentLabel',
    defaultMessage: '!!!Development vx',
    description: 'Label for development with version.',
  },
});

type Props = {
  network: networkType,
};

export default class WalletTestEnvironmentLabel extends Component<Props> {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { isFlight } = global;
    const { network } = this.props;
    const { intl } = this.context;
    const label = messages[isFlight ? 'flight' : network];
    return <div className={styles.component}>{intl.formatMessage(label)}</div>;
  }
}
