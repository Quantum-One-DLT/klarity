// @flow
import inc from 'semver/functions/inc';
import { version as currentVersion } from '../../../../package.json';
import News from '../../../../source/renderer/app/domains/News';
import type { NewsItem } from '../../../../source/renderer/app/api/news/types';

export const version = currentVersion;
export const availableAppVersion = inc(version, 'minor');

const commonUpdateData = {
  target: {
    klarityVersion: version,
    platforms: ['win32', 'linux', 'darwin'],
  },
  date: 1594043606135,
  softwareUpdate: {
    darwin: {
      version: availableAppVersion,
      hash: '97d336d45b022b0390446497dbe8b43bb6174436df12d43c4fc2b953ce22b703',
      url:
        'https://update-bcc-mainnet.tbco.io/klarity-2.0.0-mainnet-13980.pkg',
    },
    win32: {
      version: availableAppVersion,
      hash: '97d336d45b022b0390446497dbe8b43bb6174436df12d43c4fc2b953ce22b703',
      url:
        'https://update-bcc-mainnet.tbco.io/klarity-2.0.0-mainnet-13980.exe',
    },
    linux: {
      version: availableAppVersion,
      hash: '97d336d45b022b0390446497dbe8b43bb6174436df12d43c4fc2b953ce22b703',
      url:
        'https://update-bcc-mainnet.tbco.io/klarity-2.0.0-mainnet-13980.bin',
    },
  },
  type: 'software-update',
  id: 'dswkljhfksdhfksdhf',
};

export const updateEN = {
  title: `Klarity ${availableAppVersion} update`,
  content:
    'This release brings **cool new features** and *some bug fixes*. It provides a more seamless experience.  \n\nYou can find more information in the [release notes](https://klarity.io).',
  action: {
    label: 'Download Klarity at klarity.io',
    url: 'https://klarity.io',
  },
  ...commonUpdateData,
};

export const updateJP = {
  title: `Klarity${availableAppVersion}アップデート`,
  content:
    'このリリースでは、**クールな新機能**と*いくつかのバグ修正*が行われています。よりシームレスなエクスペリエンスを提供します。[リリースノート](https://klarity.io)で詳細を確認できます。',
  action: {
    label: 'klarity.ioからダウンロードする',
    url: 'https://klarity.io',
  },
  ...commonUpdateData,
};

export const update = {
  'en-US': updateEN,
  'ja-JP': updateJP,
};

export const getNewsUpdateItem = (
  read?: boolean,
  locale: string
): News.News => {
  const date = new Date().getTime();
  return new News.News({
    id: date,
    title: update[locale].title,
    content: update[locale].content,
    target: { klarityVersion: version, platform: 'darwin' },
    action: {
      label: 'Visit klarity.io',
      url: 'https://klarity.io',
    },
    date,
    type: 'software-update',
    read: read || false,
  });
};

export const newsFeedApiItemUpdate: NewsItem = {
  title: {
    'en-US': updateEN.title,
    'ja-JP': updateJP.title,
  },
  content: {
    'en-US': updateEN.content,
    'ja-JP': updateJP.content,
  },
  target: {
    klarityVersion: version,
    platform: 'linux',
  },
  action: {
    label: {
      'en-US': updateEN.action.label,
      'ja-JP': updateJP.action.label,
    },
    url: {
      'en-US': updateEN.action.url,
      'ja-JP': updateJP.action.url,
    },
  },
  date: 1571901607418,
  type: 'software-update',
};
