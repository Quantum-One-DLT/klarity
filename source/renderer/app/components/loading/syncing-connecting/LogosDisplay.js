// @flow
import React, { Component } from 'react';
import SVGInline from 'react-svg-inline';
import classNames from 'classnames';
import Lottie from 'react-lottie';
import styles from './LogosDisplay.scss';
import bccLogo from '../../../assets/images/bcc-logo.inline.svg';
import bccLogo from '../../../assets/images/bcc-logo.inline.svg';
import animationData from './logo-animation-data.json';

type Props = {
  isConnected: boolean,
};

const logoAnimationOptionsLottie = {
  loop: true,
  autoplay: true,
  animationData,
  rendererSettings: {
    preserveAspectRatio: 'xMidYMid slice',
  },
};

export default class LogosDisplay extends Component<Props> {
  componentDidMount() {
    // Manual adjustment due to `logo-animation-data.json` canvas size
    const svg: Object = document.querySelector(
      '.LogosDisplay_klarityLogo svg'
    );
    svg.setAttribute('viewBox', '534 250 212 220');
  }

  render() {
    const { isConnected } = this.props;
    const currencyLogoStyles = classNames([
      styles['bcc-logo'],
      !isConnected ? styles.connectingLogo : styles.syncingLogo,
    ]);
    const klarityLogoStyles = classNames([
      styles.klarityLogo,
      !isConnected ? styles.connectingLogo : styles.syncingLogo,
    ]);
    const apiLogoStyles = classNames([
      styles['bcc-apiLogo'],
      !isConnected ? styles.connectingLogo : styles.syncingLogo,
    ]);

    return (
      <div className={styles.component}>
        <SVGInline svg={bccLogo} className={currencyLogoStyles} />
        <div className={klarityLogoStyles}>
          <Lottie options={logoAnimationOptionsLottie} />
        </div>
        <SVGInline svg={bccLogo} className={apiLogoStyles} />
      </div>
    );
  }
}
