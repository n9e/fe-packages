/* eslint-disable react/static-property-placement */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

export default class ContextMenu extends Component {
  static propTypes = {
    children: PropTypes.element.isRequired,
    visible: PropTypes.bool,
    top: PropTypes.number,
    left: PropTypes.number,
    onVisibleChang: PropTypes.func,
  };

  static defaultProps = {
    visible: false,
    top: 0,
    left: 0,
    onVisibleChang: _.noop,
  };

  constructor(props) {
    super(props);
    const { visible, top, left } = props;
    this.state = {
      visible, top, left,
    };
  }

  componentDidMount() {
    document.addEventListener('click', this.handleDocumentContextMenuClick);
  }

  componentWillReceiveProps(nextProps) {
    const { visible, top, left } = nextProps;
    this.setState({
      visible, top, left,
    });
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleDocumentContextMenuClick);
  }

  handleDocumentContextMenuClick = () => {
    if (this.state.visible) {
      this.setState({
        visible: false,
      }, () => {
        if (_.isFunction(this.props.onVisibleChang)) this.props.onVisibleChang(false);
      });
    }
  }

  render() {
    const { top, left, visible } = this.state;
    return (
      <div style={{
        display: visible ? 'block' : 'none',
        position: 'fixed',
        top,
        left,
        zIndex: 9999,
      }}
      >
        {this.props.children}
      </div>
    );
  }
}
