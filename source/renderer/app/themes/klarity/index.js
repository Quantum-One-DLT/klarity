import { isEmpty } from 'lodash';
import { BCC_THEME_OUTPUT } from './bcc';
import { DARK_BLUE_THEME_OUTPUT } from './dark-blue';
import { DARK_BCC_THEME_OUTPUT } from './dark-bcc';
import { FLIGHT_CANDIDATE_THEME_OUTPUT } from './flight-candidate';
import { INCENTIVIZED_TESTNET_THEME_OUTPUT } from './incentivized-testnet';
import { LIGHT_BLUE_THEME_OUTPUT } from './light-blue';
import { SOPHIE_TESTNET_THEME_OUTPUT } from './sophie-testnet';
import { WHITE_THEME_OUTPUT } from './white';
import { YELLOW_THEME_OUTPUT } from './yellow';

export const EXISTING_THEME_OUTPUTS = [
  ['bcc.js', BCC_THEME_OUTPUT],
  ['dark-blue.js', DARK_BLUE_THEME_OUTPUT],
  ['dark-bcc.js', DARK_BCC_THEME_OUTPUT],
  ['flight-candidate.js', FLIGHT_CANDIDATE_THEME_OUTPUT],
  ['incentivized-testnet.js', INCENTIVIZED_TESTNET_THEME_OUTPUT],
  ['light-blue.js', LIGHT_BLUE_THEME_OUTPUT],
  ['sophie-testnet.js', SOPHIE_TESTNET_THEME_OUTPUT],
  ['white.js', WHITE_THEME_OUTPUT],
  ['yellow.js', YELLOW_THEME_OUTPUT],
];

export const EXISTING_THEME_OUTPUTS_OBJ = EXISTING_THEME_OUTPUTS.reduce(
  (outputsObj, theme) => {
    const [themeName, themeOutput] = theme;
    if (themeName && !isEmpty(themeOutput)) {
      outputsObj[themeName] = themeOutput;
    }
    return outputsObj;
  },
  {}
);
