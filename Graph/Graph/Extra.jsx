import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Icon, Dropdown, Menu } from 'antd';
import Info from './Info';
import * as config from '../config';

/**
 * 图表右侧默认操作
 * - 显示详情信息
 * - 触发开启配置面板的按钮图标
 */

export default class Extra extends Component {
  static propTypes = {
    graphConfig: PropTypes.shape(config.graphPropTypes).isRequired,
    counterList: PropTypes.array,
    moreList: PropTypes.node,
    onOpenGraphConfig: PropTypes.func,
  };

  static defaultProps = {
    moreList: null,
    counterList: [],
    onOpenGraphConfig: () => {},
  };

  onOpenGraphConfig = () => {
    this.props.onOpenGraphConfig(this.props.graphConfig);
  }

  render() {
    return (
      <div style={{ display: 'inline-block' }}>
        <span className="graph-extra-item">
          <Info
            graphConfig={this.props.graphConfig}
            counterList={this.props.counterList}
          >
            <Icon type="info-circle-o" />
          </Info>
        </span>
        <span className="graph-extra-item">
          <Icon onClick={this.onOpenGraphConfig} type="setting" />
        </span>
        <span className="graph-extra-item">
          <Dropdown trigger={['click']} overlay={
            <Menu>
              {this.props.moreList}
            </Menu>
          }>
            <span>
              <Icon type="bars" />
            </span>
          </Dropdown>
        </span>
      </div>
    );
  }
}
