import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import $ from 'jquery';
import './style.less';


function removeListeners() {
  $(window).off('mouseup.splitter');
  $(window).off('mousemove.splitter');
}

export default class Splitter extends Component {
  static propTypes = {
    onResizeStart: PropTypes.func,
    onResizeEnd: PropTypes.func,
    onResize: PropTypes.func,
  };
  static defaultProps = {
    onResizeStart: _.noop,
    onResizeEnd: _.noop,
    onResize: _.noop,
  };
    startPositionX: number;

  constructor(props: any) {
    super(props);
    this.state = {};
    this.startPositionX = 0;
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
  }

  componentWillUnmount() {
    removeListeners();
  }

  updateStartPositionX(e: any) {
    this.startPositionX = e.clientX;
  }

  handleMouseMove(e: any) {
    e.preventDefault();
    const { onResize } = this.props;
    const diff = this.startPositionX - e.clientX;
    if (diff !== 0) {
      onResize(diff);
    }
    this.updateStartPositionX(e);
  }

  handleMouseUp(e: any) {
    e.preventDefault();
    const { onResizeEnd } = this.props;
    onResizeEnd();
    removeListeners();
  }

  handleMouseDown(e: any) {
    e.preventDefault();
    const { onResizeStart } = this.props;
    onResizeStart();
    this.updateStartPositionX(e);
    $(window).on('mouseup.splitter', this.handleMouseUp);
    $(window).on('mousemove.splitter', this.handleMouseMove);
  }

  render() {
    return (
        <div className="layout-splitter-handle">
        <div
          className="layout-splitter-handle-highlight"
          onMouseDown={this.handleMouseDown}
          role="button"
          tabIndex={0}
        />
      </div>
    );
  }
}
