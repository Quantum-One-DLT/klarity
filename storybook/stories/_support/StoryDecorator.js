// @flow
import React, { Component, Children } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { ThemeProvider } from 'react-polymorph/lib/components/ThemeProvider';
import { SimpleSkins } from 'react-polymorph/lib/skins/simple';
import { SimpleDefaults } from 'react-polymorph/lib/themes/simple';
import { klarityTheme } from '../../../source/renderer/app/themes/klarity';
import { themeOverrides } from '../../../source/renderer/app/themes/overrides';

type Props = {
  children: Node,
  propsForChildren?: any,
};

@observer
export default class StoryDecorator extends Component<Props> {
  static defaultProps = {
    propsForChildren: {},
  };

  render() {
    const { children, propsForChildren } = this.props;
    return (
      <ThemeProvider
        theme={klarityTheme}
        skins={SimpleSkins}
        variables={SimpleDefaults}
        themeOverrides={themeOverrides}
      >
        {Children.map(children, (child) => {
          const childProps = child.type === 'div' ? {} : { propsForChildren };
          return React.cloneElement(child, childProps);
        })}
      </ThemeProvider>
    );
  }
}
