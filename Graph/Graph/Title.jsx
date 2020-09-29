import React, { Component } from 'react';
import PropTypes from 'prop-types';

// eslint-disable-next-line react/prefer-stateless-function
export default class Title extends Component {
  static propTypes = {
    title: PropTypes.string,
    selectedMetric: PropTypes.array,
  };

  static defaultProps = {
    title: '',
    selectedMetric: [],
  };

  render() {
    const { title, selectedMetric } = this.props;
    const styleObj = {
      width: '100%',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
    };
    let realTitle = title;

    if (!title) {
      realTitle = selectedMetric;
    }

    return (
      <div className="graph-title">
        <div title={realTitle} style={styleObj}>
          {realTitle}
        </div>
      </div>
    );
  }
}
