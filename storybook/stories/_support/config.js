// @flow
import bcc from '../../../source/renderer/app/themes/klarity/bcc.js';
import darkBlue from '../../../source/renderer/app/themes/klarity/dark-blue.js';
import lightBlue from '../../../source/renderer/app/themes/klarity/light-blue.js';
import darkBcc from '../../../source/renderer/app/themes/klarity/dark-bcc.js';
import flightCandidate from '../../../source/renderer/app/themes/klarity/flight-candidate.js';
import white from '../../../source/renderer/app/themes/klarity/white.js';
import yellow from '../../../source/renderer/app/themes/klarity/yellow.js';
import incentivizedTestnet from '../../../source/renderer/app/themes/klarity/incentivized-testnet.js';
import sophieTestnet from '../../../source/renderer/app/themes/klarity/sophie-testnet.js';

export const themes = {
  Bcc: bcc,
  DarkBlue: darkBlue,
  LightBlue: lightBlue,
  DarkBcc: darkBcc,
  FlightCandidate: flightCandidate,
  Yellow: yellow,
  White: white,
  IncentivizedTestnet: incentivizedTestnet,
  SophieTestnet: sophieTestnet,
};
export const themeNames: Array<any> = Object.keys(themes);
export const themesIds = {
  Bcc: 'bcc',
  DarkBlue: 'dark-blue',
  LightBlue: 'light-blue',
  DarkBcc: 'dark-bcc',
  FlightCandidate: 'flight-candidate',
  Yellow: 'yellow',
  White: 'white',
  IncentivizedTestnet: 'incentivized-testnet',
  SophieTestnet: 'sophie-testnet',
};

export const locales = {
  English: 'en-US',
  Japanese: 'ja-JP',
};
export const localeNames: Array<any> = Object.keys(locales);

export const operatingSystems = {
  Windows: 'windows',
  Linux: 'linux',
  Mac: 'mac',
};
export const osNames: Array<any> = Object.keys(operatingSystems);

// These differences are due to the different menu heights on each OS
export const osMinWindowHeights = {
  Windows: '641px',
  Linux: '660px',
  Mac: '700px',
};

/* eslint-disable no-restricted-globals */
const getParams = (param: string) => {
  const { hash, search } = parent.window.location;
  const queries = hash || search;
  const params = new URLSearchParams(queries.slice(1));
  return params.get(param);
};

export const getInitialState = () => {
  const themeName =
    getParams('themeName') ||
    sessionStorage.getItem('themeName') ||
    themeNames[0];

  const localeName =
    getParams('localeName') ||
    sessionStorage.getItem('localeName') ||
    localeNames[0];

  const osName =
    getParams('osName') || sessionStorage.getItem('osName') || osNames[0];

  return {
    themeName,
    localeName,
    osName,
  };
};
