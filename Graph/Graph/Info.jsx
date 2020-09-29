import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment';
import { Popover, Table } from 'antd';
import * as config from '../config';

/**
 * 图表详细信息
 * 节点、指标、时间范围、单位(可选)
 */

const apiTooltipHelp = [
  {
    id: 0,
    cn: '正常',
    en: 'OK',
  }, {
    id: 1,
    cn: '异常',
    en: 'ERROR',
  }, {
    id: 2,
    cn: '返回内容校验失败',
    en: 'RETURN_CHECK_ERROR',
  }, {
    id: 3,
    cn: 'URL 格式错误',
    en: 'URL_FORMAT_ERROR',
  }, {
    id: 6,
    cn: 'DNS解析失败',
    en: 'COULDNT_RESOLVE_HOST',
  }, {
    id: 7,
    cn: '连接失败 or 超时',
    en: 'COULDNT_CONNECT',
  }, {
    id: 13,
    cn: '请求处理超时',
    en: 'READ_WRITE_TIMEOUT',
  }, {
    id: 14,
    cn: '超过重定向次数',
    en: 'TOO_MANY_REDIRECTS',
  }, {
    id: 15,
    cn: 'SSL握手失败',
    en: 'PEER_FAILED_VERIFICATION',
  }, {
    id: 16,
    cn: '未定义错误',
    en: 'SYS_UNKNOWN_ERROR',
  },
];

export default class Info extends Component {
  static propTypes = {
    graphConfig: PropTypes.shape(config.graphPropTypes).isRequired,
    // counterList: PropTypes.array.isRequired,
    children: PropTypes.element.isRequired,
  };

  shouldComponentUpdate(nextProps) {
    return !_.isEqual(nextProps, this.props);
  }

  getContent() {
    const { graphConfig, counterList } = this.props;
    const { unit, start, end } = graphConfig;
    const metricGroup = _.groupBy(counterList, 'metric');

    return (
      _.map(metricGroup, (metricGroupVals, groupName) => {
        const firstItem = metricGroupVals[0] || {};
        return (
          <ul className="graph-info" key={groupName}>
            <li>
              <span className="graph-info-key">Metric:</span>
              <span className="graph-info-value">{groupName}</span>
            </li>
            <li>
              <span className="graph-info-key">Step:</span>
              <span className="graph-info-value">{firstItem.step ? `${firstItem.step} s` : '无'}</span>
            </li>
            <li>
              <span className="graph-info-key">Time:</span>
              <span className="graph-info-value">
                {moment(Number(start)).format(config.timeFormatMap.moment)}
                <span> - </span>
                {moment(Number(end)).format(config.timeFormatMap.moment)}
              </span>
            </li>
            {
              unit ?
                <li>
                  <span className="graph-info-key">unit:</span>
                  <span className="graph-info-value">{unit}</span>
                </li> : null
            }
            {
              groupName === 'api.status' ?
                <Table
                  style={{ marginTop: 10 }}
                  bordered
                  size="small"
                  dataSource={apiTooltipHelp}
                  pagination={false}
                  columns={[
                    {
                      title: 'Value',
                      dataIndex: 'id',
                    }, {
                      title: 'Status',
                      dataIndex: 'cn',
                      colSpan: 2,
                    }, {
                      dataIndex: 'en',
                      colSpan: 0,
                    },
                  ]}
                /> : null
            }
          </ul>
        );
      })
    );
  }

  render() {
    return (
      <Popover
        trigger="click"
        content={this.getContent()}
        placement="left"
      >
        {this.props.children}
      </Popover>
    );
  }
}
