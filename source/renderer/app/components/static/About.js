// @flow
import React, { Component } from 'react';
import SVGInline from 'react-svg-inline';
import { defineMessages, intlShape, FormattedHTMLMessage } from 'react-intl';
import { Link } from 'react-polymorph/lib/components/Link';
import { LinkSkin } from 'react-polymorph/lib/skins/simple/LinkSkin';
import DialogCloseButton from '../widgets/DialogCloseButton';
import globalMessages from '../../i18n/global-messages';
import styles from './About.scss';
import closeCrossThin from '../../assets/images/close-cross-thin.inline.svg';
import klarityIcon from '../../assets/images/klarity-logo-loading-grey.inline.svg';
import bccIcon from '../../assets/images/bcc-logo.inline.svg';

const messages = defineMessages({
  aboutTitle: {
    id: 'static.about.title',
    defaultMessage: '!!!Klarity',
    description: 'About "title"',
  },
  aboutContentKlarityHeadline: {
    id: 'static.about.content.klarity.headline',
    defaultMessage: '!!!Klarity Team:',
    description: 'About page klarity team headline',
  },
  aboutContentBccHeadline: {
    id: 'static.about.content.bcc.headline',
    defaultMessage: '!!!Bcc Team:',
    description: 'About page bcc team headline',
  },
  aboutContentKlarityMembers: {
    id: 'static.about.content.klarity.members',
    defaultMessage:
      '!!!Alan McNicholas, Aleksandar Djordjevic, Alexander Rukin, Brian McKenna, Charles Hoskinson, Danilo Prates, Darko Mijić, Dominik Guzei, Elin Liu, Gabriela Ponce, Jane Wild, Jeremy Wood, Juli Sudi, Junko Oda, Laurie Wang, Manus McCole, Michael Bishop, Mior Sufian, Nikola Glumac, Piotr Stachyra, Rhys Bartels-Waller, Richard Wild, Robert Moore, Rodney Lorrimar, Sam Jeston, Samuel Leathers, Serge Kosyrev, Tatyana Valkevych, Tomas Vrana, Tomislav Horaček, Yakov Karavelov',
    description: 'About page klarity team members',
  },
  aboutContentBccMembers: {
    id: 'static.about.content.bcc.members',
    defaultMessage:
      "!!!Alexander Sukhoverkhov, Alexander Vieth, Alexandre Rodrigues Baldé, Alfredo Di Napoli, Anastasiya Besman, Andrzej Rybczak, Ante Kegalj, Anton Belyy, Anupam Jain, Arseniy Seroka, Artyom Kazak, Carlos D'Agostino, Charles Hoskinson, Dan Friedman, Denis Shevchenko, Dmitry Kovanikov, Dmitry Mukhutdinov, Dmitry Nikulin, Domen Kožar, Duncan Coutts, Edsko de Vries, Eileen Fitzgerald, George Agapov, Hiroto Shioi, Ilya Lubimov, Ilya Peresadin, Ivan Gromakovskii, Jake Mitchell, Jane Wild, Jens Krause, Jeremy Wood, Joel Mislov Kunst, Jonn Mostovoy, Konstantin Ivanov, Kristijan Šarić, Lars Brünjes, Laurie Wang, Lionel Miller, Michael Bishop, Mikhail Volkhov, Niklas Hambüchen, Peter Gaži, Philipp Kant, Serge Kosyrev, Vincent Hanquez",
    description: 'About page bcc team members',
  },
  aboutCopyright: {
    id: 'static.about.copyright',
    defaultMessage: '!!!The Blockchain Company.io Limited. Licensed under',
    description: 'About "copyright"',
  },
  licenseLink: {
    id: 'static.about.license',
    defaultMessage: '!!!Apache 2.0 license',
    description: 'About page license name',
  },
  aboutBuildInfo: {
    id: 'static.about.buildInfo',
    defaultMessage: '!!!MacOS build 3769, with Bcc 1.0.4',
    description: 'About page build information',
  },
});

type Props = {
  apiVersion: string,
  nodeVersion: string,
  build: string,
  onOpenExternalLink: Function,
  os: string,
  version: string,
  onClose: Function,
};

export default class About extends Component<Props> {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.context;
    const {
      apiVersion,
      nodeVersion,
      build,
      onOpenExternalLink,
      os,
      version,
      onClose,
    } = this.props;
    const apiName = intl.formatMessage(globalMessages.apiName);
    const apiIcon = bccIcon;
    const apiHeadline = intl.formatMessage(
      messages.aboutContentBccHeadline
    );
    const apiMembers = intl.formatMessage(messages.aboutContentBccMembers);

    return (
      <div className={styles.container}>
        <DialogCloseButton
          className={styles.closeButton}
          icon={closeCrossThin}
          onClose={onClose}
        />
        <div className={styles.headerWrapper}>
          <SVGInline svg={klarityIcon} className={styles.klarityIcon} />

          <div className={styles.klarityTitleVersion}>
            <div className={styles.klarityTitle}>
              {intl.formatMessage(messages.aboutTitle)}
              <span className={styles.klarityVersion}>{version}</span>
            </div>
            <div className={styles.klarityBuildInfo}>
              <FormattedHTMLMessage
                {...messages.aboutBuildInfo}
                values={{
                  platform: os,
                  build,
                  apiName,
                  apiVersion,
                  nodeVersion,
                }}
              />
            </div>
          </div>

          <SVGInline svg={apiIcon} className={styles.apiIcon} />
        </div>

        <div className={styles.contentText}>
          <h2>{intl.formatMessage(messages.aboutContentKlarityHeadline)}</h2>

          <div className={styles.contentKlarity}>
            {intl.formatMessage(messages.aboutContentKlarityMembers)}
          </div>

          <h2>{apiHeadline}</h2>

          <div className={styles.apiMembers}>{apiMembers}</div>
        </div>

        <div className={styles.footerWrapper}>
          <Link
            className={styles.link}
            onClick={() => onOpenExternalLink('https://klaritywallet.io')}
            label="http://klaritywallet.io"
            skin={LinkSkin}
          />

          <div className={styles.copyright}>
            {intl.formatMessage(messages.aboutCopyright)}&nbsp;
            <Link
              className={styles.link}
              onClick={() =>
                onOpenExternalLink(
                  'https://github.com/The-Blockchain-Company/klarity/blob/master/LICENSE'
                )
              }
              label={intl.formatMessage(messages.licenseLink)}
              skin={LinkSkin}
            />
          </div>
        </div>
      </div>
    );
  }
}
