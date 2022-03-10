// @flow
import addons from '@storybook/addons';

const channel = addons.getChannel();

export const setInitialState = (initialState: Object) =>
  Object.entries(initialState).forEach(([param, value]) =>
    updateParam({ param, value })
  );

channel.on('klarityMenu/updateParam', (query) => {
  channel.emit('klarityMenu/paramUpdated', query);
});

export const updateParam = (query: Object) =>
  channel.emit('klarityMenu/updateParam', query);

export const onReceiveParam = (cb: Function) =>
  channel.on('klarityMenu/updateParam', (query) => {
    cb(query);
  });
