// @flow
import React from 'react';
import addons, { types } from '@storybook/addons';
import KlarityMenu from './KlarityMenu';

/* eslint-disable react/display-name  */

const ADDON_ID = 'klaritymenu';
const PANEL_ID = `${ADDON_ID}/panel`;

addons.register(ADDON_ID, (api) => {
  const render = () => <KlarityMenu api={api} />;
  addons.add(PANEL_ID, {
    type: types.TOOL,
    render,
  });
});
