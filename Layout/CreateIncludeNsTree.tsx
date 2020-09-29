import React from 'react';
import _ from 'lodash';
import { NsTreeContext } from './Provider';

export default function CreateIncludeNsTree(WrappedComponent: React.ComponentType, opts?: any) {
  return class HOC extends React.Component {
    static contextType = NsTreeContext;

    componentWillMount() {
      const { nsTreeVisibleChange } = this.context;
      nsTreeVisibleChange(_.get(opts, 'visible', false), false, _.get(opts, 'visible', false));
    }

    render() {
      return <WrappedComponent {...this.props} />;
    }
  };
}
