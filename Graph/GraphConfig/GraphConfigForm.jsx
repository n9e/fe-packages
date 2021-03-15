/* eslint-disable */
/* eslint-disable react/no-access-state-in-setstate */
/* eslint-disable react/sort-comp */
/* eslint-disable consistent-return */
/* eslint-disable class-methods-use-this */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import update from 'react-addons-update';
import { Row, Col, Spin, Table, Form, Select, Input, InputNumber, Icon, TreeSelect, Radio } from 'antd';
import _ from 'lodash';
import moment from 'moment';
import { FormattedMessage } from 'react-intl';
import DateInput from '../../DateInput';
import { normalizeTreeData, renderTreeNodes } from '../../Layout/utils';
import request from '../../request';
import api from '../../api';
import Tagkv from './Tagkv';
import Comparison from './Comparison';
import * as config from '../config';
import { getTimeLabelVal } from '../util';
import hasDtag from '../util/hasDtag';
import * as services from '../services';

const FormItem = Form.Item;
const { Option } = Select;
function normalizeMetrics(metrics) {
  if (_.isEmpty(metrics)) {
    return [{
      key: _.uniqueId('METRIC_'),
      selectedNid: undefined,
      selectedMetric: '',
    }];
  }
  return _.map(metrics, metric => ({
    ...metric,
    key: metric.selectedMetric || _.uniqueId('METRIC_'),
  }));
}

function intersectionTagkv(selectedTagkv, tagkv) {
  return _.intersectionBy(selectedTagkv, tagkv, 'tagk');
}

function getCountersLength(counters) {
  let len = 1;
  _.each(counters, (item) => {
    const tagsLen = !_.get(item, 'tags.length') ? 1 : _.get(item, 'tags.length');
    const nidsLen = !_.get(item, 'nids.length') ? 1 : _.get(item, 'nids.length');
    len = len * tagsLen * nidsLen;
  });
  return len;
}

/**
 * graph 配置面板 - 表单组件
 * 多 ns、metric 场景，已选取交集，待选取并集
 */

class GraphConfigForm extends Component {
  static propTypes = {
    data: PropTypes.shape({
      ...config.graphPropTypes,
      tag_id: PropTypes.number,
      alias: PropTypes.string,
    }),
    isScreen: PropTypes.bool,
    subclassOptions: PropTypes.array,
    btnDisable: PropTypes.func.isRequired, // ? 是否可以优化
  };

  static defaultProps = {
    data: {},
    isScreen: false,
    subclassOptions: [],
  };

  constructor(props) {
    super(props);
    const { data } = props;
    const metrics = normalizeMetrics(data.metrics);
    this.xhrs = [];
    this.state = {
      // graph config
      graphConfig: {
        ...config.graphDefaultConfig,
        ...props.data,
        metrics,
      },
      loading: false,
      tableEmptyText: '暂无数据',
      nsSearchVal: '', // 节点搜索值
      counterListVisible: false,
      advancedVisible: false,
    };
  }

  componentDidMount() {
    this.fetchTreeData(() => {
      this.fetchAllByMetric();
    });
  }

  setLoading(loading) {
    this.setState({ loading });
    this.props.btnDisable(loading);
  }

  getColumns() {
    return [
      {
        title: '曲线',
        dataIndex: 'counter',
      }, {
        title: '周期',
        dataIndex: 'step',
        width: 45,
        render(text) {
          return <span>{text}s</span>;
        },
      },
    ];
  }

  fetchTreeData(cbk) {
    request({
      url: api.tree,
    }).then((res) => {
      const treeData = normalizeTreeData(res);
      this.setState({ treeData, originTreeData: res }, () => {
        if (cbk) cbk();
      });
    });
  }

  async fetchAllByMetric() {
    const { metrics } = this.state.graphConfig;
    const currentMetricObj = _.cloneDeep(metrics[0]);
    const currentMetricObjIndex = 0;

    currentMetricObj.endpointsKey = currentMetricObj.endpointsKey || 'endpoints';

    if (currentMetricObj) {
      try {
        this.setLoading(true);
        if (currentMetricObj.selectedNid !== undefined) {
          await this.fetchEndpoints(currentMetricObj, true);
          if (!_.isEmpty(currentMetricObj.selectedEndpoint)) {
            await this.fetchMetrics(currentMetricObj, true);
            if (currentMetricObj.selectedMetric) {
              await this.fetchTagkv(currentMetricObj);
              if (currentMetricObj.selectedTagkv) {
                await this.fetchCounterList(currentMetricObj);
              }
            }
          }
        }
        this.setState(update(this.state, {
          graphConfig: {
            metrics: {
              $splice: [
                [currentMetricObjIndex, 1, currentMetricObj],
              ],
            },
          },
        }));
        this.setLoading(false);
      } catch (e) {
        this.setLoading(false);
      }
    }
  }

  async fetchEndpoints(metricObj, isFirst = false) {
    if (metricObj.endpointsKey === 'endpoints') {
      try {
        let endpoints = await services.fetchEndPoints(metricObj.selectedNid);
        endpoints = _.map(endpoints, 'ident');
        let selectedEndpoint = metricObj.selectedEndpoint || ['=all'];
        if (!hasDtag(selectedEndpoint)) {
          selectedEndpoint = _.intersection(endpoints, metricObj.selectedEndpoint);
        }
        if (isFirst && _.isEmpty(selectedEndpoint)) {
          selectedEndpoint = metricObj.selectedEndpoint;
        }
        metricObj.endpoints = endpoints;
        metricObj.selectedEndpoint = selectedEndpoint;
        return metricObj;
      } catch (e) {
        return e;
      }
    } else {
      metricObj.selectedEndpoint = _.isEmpty(metricObj.selectedEndpoint) ? metricObj.selectedNid : metricObj.selectedEndpoint;
    }
  }

  async fetchMetrics(metricObj, isFirst = false) {
    try {
      const endpoints = metricObj.endpointsKey === 'endpoints' ? metricObj.selectedEndpoint : [metricObj.selectedNid];
      const metricList = await services.fetchMetrics(endpoints, metricObj.endpoints, metricObj.endpointsKey);
      const selectedMetric = _.indexOf(metricList, metricObj.selectedMetric) > -1 ? metricObj.selectedMetric : '';
      metricObj.metrics = metricList;
      metricObj.selectedMetric = selectedMetric;
      return metricObj;
    } catch (e) {
      console.log(e);
      return e;
    }
  }

  async fetchTagkv(metricObj) {
    try {
      const endpoints = metricObj.endpointsKey === 'endpoints' ? metricObj.selectedEndpoint : [metricObj.selectedNid];
      const tagkv = await services.fetchTagkv(endpoints, metricObj.selectedMetric, metricObj.endpoints, metricObj.endpointsKey);
      let selectedTagkv = _.isEmpty(metricObj.selectedTagkv) ? _.chain(tagkv).map((item) => {
        if (item.tagk !== 'endpoint' && item.tagk !== 'nids') {
          return { tagk: item.tagk, tagv: ['=all'] };
        };
        if (item.tagk === 'endpoint') {
          return { tagk: item.tagk, tagv: metricObj.selectedEndpoint };
        }
        return item;
      }).value() : metricObj.selectedTagkv;

      metricObj.tagkv = tagkv;
      metricObj.selectedTagkv = selectedTagkv;

      if (metricObj.endpointsKey === 'nids') {
        metricObj.selectedEndpoint = _.get(_.find(tagkv, { tagk: 'nids' }), 'tagv');
      }
    } catch (e) {
      return e;
    }
  }

  async fetchCounterList(metricObj) {
    try {
      let selectedEndpoint = metricObj.selectedEndpoint;
      if (hasDtag(selectedEndpoint)) {
        selectedEndpoint = _.get(_.find(metricObj.tagkv, { tagk: 'endpoint' }), 'tagv');
      }
      const counterList = await services.fetchCounterList([{
        // selectedEndpoint: metricObj.selectedEndpoint,
        selectedMetric: metricObj.selectedMetric,
        selectedTagkv: metricObj.selectedTagkv,
        tagkv: metricObj.tagkv,
        endpointsKey: metricObj.endpointsKey,
        selectedEndpoint: selectedEndpoint,
      }])
      metricObj.counterList = counterList.list;
      metricObj.counterListCount = counterList.count;
    } catch (e) {
      console.log(e)
      return e;
    }
  }

  handleCommonFieldChange = (changedObj) => {
    const newChangedObj = {};
    _.each(changedObj, (val, key) => {
      newChangedObj[key] = {
        $set: val,
      };
    });
    this.setState(update(this.state, {
      graphConfig: newChangedObj,
    }));
  }

  handleNsChange = async (selectedNid, currentMetricObj) => {
    try {
      this.setLoading(true);
      currentMetricObj.selectedNid = selectedNid;
      if (currentMetricObj.endpointsKey === 'nids') {
        currentMetricObj.selectedEndpoint = selectedNid;
      }
      if (selectedNid !== undefined) {
        await this.fetchEndpoints(currentMetricObj);
        if (!_.isEmpty(currentMetricObj.selectedEndpoint)) {
          await this.fetchMetrics(currentMetricObj);
          if (currentMetricObj.selectedMetric) {
            await this.fetchTagkv(currentMetricObj);
            if (currentMetricObj.selectedTagkv) {
              await this.fetchCounterList(currentMetricObj);
            }
          }
        }
      } else {
        // delete ns
        currentMetricObj.endpoints = [];
        currentMetricObj.selectedEndpoint = [];
        currentMetricObj.metrics = [];
        currentMetricObj.selectedMetric = '';
        currentMetricObj.tagkv = [];
        currentMetricObj.selectedTagkv = [];
        currentMetricObj.counterList = [];
      }

      this.setState(update(this.state, {
        graphConfig: {
          metrics: {
            $splice: [
              [0, 1, currentMetricObj],
            ],
          },
        },
      }));
      this.setLoading(false);
    } catch (e) {
      console.error(e);
      this.setLoading(false);
    }
  }

  handleEndpointsKeyChange = async (endpointsKey, currentMetricObj) => {
    try {
      this.setLoading(true);
      if (currentMetricObj.selectedNid) {
        if (endpointsKey === 'endpoints') {
          currentMetricObj.selectedNid = currentMetricObj.selectedNid[0];
        }
        if (endpointsKey === 'nids') {
          currentMetricObj.selectedNid = [currentMetricObj.selectedNid];
        }
      }
      currentMetricObj.endpointsKey = endpointsKey;
      currentMetricObj.selectedEndpoint = [];
      currentMetricObj.tagkv = [];
      await this.fetchEndpoints(currentMetricObj);
      await this.fetchMetrics(currentMetricObj);
      if (currentMetricObj.selectedMetric) {
        await this.fetchTagkv(currentMetricObj);
        if (currentMetricObj.selectedTagkv) {
          await this.fetchCounterList(currentMetricObj);
        }
      }
      this.setState(update(this.state, {
        graphConfig: {
          metrics: {
            $splice: [
              [0, 1, currentMetricObj],
            ],
          },
        },
      }));
      this.setLoading(false);
    } catch (e) {
      console.error(e);
      this.setLoading(false);
    }
  }

  handleEndpointChange = async (selectedEndpoint) => {
    const { metrics } = this.state.graphConfig;
    const currentMetricObj = _.cloneDeep(metrics[0]);
    const currentMetricObjIndex = 0;

    if (currentMetricObj) {
      try {
        this.setLoading(true);
        currentMetricObj.selectedEndpoint = selectedEndpoint;
        const endpointTagkv = _.find(currentMetricObj.selectedTagkv, { tagk: 'endpoint' });
        if (endpointTagkv) {
          endpointTagkv.tagv = selectedEndpoint;
        } else {
          currentMetricObj.selectedTagkv = [
            ...currentMetricObj.selectedTagkv || [],
            {
              tagk: 'endpoint',
              tagv: selectedEndpoint,
            },
          ];
        }

        if (!_.isEmpty(currentMetricObj.selectedEndpoint)) {
          await this.fetchMetrics(currentMetricObj);
        }

        currentMetricObj.tagkv = [];
        currentMetricObj.selectedTagkv = [];
        currentMetricObj.counterList = [];

        this.setState(update(this.state, {
          graphConfig: {
            metrics: {
              $splice: [
                [currentMetricObjIndex, 1, currentMetricObj],
              ],
            },
          },
        }));
        this.setLoading(false);
      } catch (e) {
        console.error(e);
        this.setLoading(false);
      }
    }
  }

  handleMetricChange = async (selectedMetric, currentMetric) => {
    const { metrics } = this.state.graphConfig;
    const currentMetricObj = _.cloneDeep(_.find(metrics, { selectedMetric: currentMetric }));
    const currentMetricObjIndex = _.findIndex(metrics, { selectedMetric: currentMetric });

    if (currentMetricObj) {
      try {
        this.setLoading(true);
        currentMetricObj.selectedMetric = selectedMetric;
        currentMetricObj.tagkv = [];
        currentMetricObj.selectedTagkv = [];
        currentMetricObj.counterList = [];

        if (selectedMetric) {
          await this.fetchTagkv(currentMetricObj);
          if (currentMetricObj.selectedTagkv) {
            await this.fetchCounterList(currentMetricObj);
          }
        }

        this.setState(update(this.state, {
          graphConfig: {
            metrics: {
              $splice: [
                [currentMetricObjIndex, 1, currentMetricObj],
              ],
            },
          },
        }));
        this.setLoading(false);
      } catch (e) {
        console.error(e);
        this.setLoading(false);
      }
    }
  }

  handleTagkvChange = async (currentMetric, tagk, tagv) => {
    const { metrics } = this.state.graphConfig;
    const currentMetricObj = _.cloneDeep(_.find(metrics, { selectedMetric: currentMetric }));
    const currentMetricObjIndex = _.findIndex(metrics, { selectedMetric: currentMetric });
    const currentTagIndex = _.findIndex(currentMetricObj.selectedTagkv, { tagk });

    if (currentTagIndex > -1) {
      if (!tagv.length) { // 删除
        currentMetricObj.selectedTagkv = update(currentMetricObj.selectedTagkv, {
          $splice: [
            [currentTagIndex, 1],
          ],
        });
      } else { // 修改
        currentMetricObj.selectedTagkv = update(currentMetricObj.selectedTagkv, {
          $splice: [
            [currentTagIndex, 1, {
              tagk, tagv,
            }],
          ],
        });
      }
    } else if (tagv.length) { // 添加
      currentMetricObj.selectedTagkv = update(currentMetricObj.selectedTagkv, {
        $push: [{
          tagk, tagv,
        }],
      });
    }
    this.setState(update(this.state, {
      graphConfig: {
        metrics: {
          $splice: [
            [currentMetricObjIndex, 1, currentMetricObj],
          ],
        },
      },
    }));
    try {
      this.setLoading(true);
      await this.fetchCounterList(currentMetricObj);
      this.setLoading(false);
    } catch (e) {
      console.error(e);
      this.setLoading(false);
    }
  }

  handleAggregateChange = (currentMetric, value) => {
    const { metrics } = this.state.graphConfig;
    const currentMetricObj = _.cloneDeep(_.find(metrics, { selectedMetric: currentMetric }));
    const currentMetricObjIndex = _.findIndex(metrics, { selectedMetric: currentMetric });

    currentMetricObj.aggrFunc = value;
    this.setState(update(this.state, {
      graphConfig: {
        metrics: {
          $splice: [
            [currentMetricObjIndex, 1, currentMetricObj],
          ],
        },
      },
    }));
  }

  handleAggregateDimensionChange = (currentMetric, value) => {
    const { metrics } = this.state.graphConfig;
    const currentMetricObj = _.cloneDeep(_.find(metrics, { selectedMetric: currentMetric }));
    const currentMetricObjIndex = _.findIndex(metrics, { selectedMetric: currentMetric });

    currentMetricObj.aggrGroup = value;
    this.setState(update(this.state, {
      graphConfig: {
        metrics: {
          $splice: [
            [currentMetricObjIndex, 1, currentMetricObj],
          ],
        },
      },
    }));
  }

  handleSubclassChange = (val) => {
    this.setState(update(this.state, {
      graphConfig: {
        subclassId: {
          $set: val,
        },
      },
    }));
  }

  handleTitleChange = (e) => {
    this.setState(update(this.state, {
      graphConfig: {
        title: {
          $set: e.target.value,
        },
      },
    }));
  }

  handleTimeOptionChange = (val) => {
    const now = moment();
    let { start, end } = this.state.graphConfig;

    if (val !== 'custom') {
      start = now.clone().subtract(Number(val), 'ms').format('x');
      end = now.format('x');
    } else {
      start = moment(Number(start)).format('x');
      end = moment().format('x');
    }
    this.setState(update(this.state, {
      graphConfig: {
        start: {
          $set: start,
        },
        end: {
          $set: end,
        },
        now: {
          $set: end,
        },
      },
    }));
  }

  handleDateChange = (key, d) => {
    const val = _.isDate(d) ? _.toString(d.getTime()) : null;
    this.setState(update(this.state, {
      graphConfig: {
        [key]: {
          $set: val,
        },
      },
    }));
  }

  handleThresholdChange = (val) => {
    this.setState(update(this.state, {
      graphConfig: {
        threshold: {
          $set: val,
        },
      },
    }));
  }

  linkChange = (e) => {
    this.setState(update(this.state, {
      graphConfig: {
        link: {
          $set: e.target.value,
        },
      },
    }));
  }

  renderMetrics() {
    const { metrics, chartTypeOptions } = this.state.graphConfig;
    const metricObj = metrics[0]; // 当前只支持一个指标
    const currentMetric = metricObj.selectedMetric;
    const withoutEndpointTagkv = _.filter(metricObj.tagkv, item => item.tagk !== 'endpoint' && item.tagk !== 'nids');
    const treeDefaultExpandedKeys = metricObj.selectedNid;
    const aggrGroupOptions = _.map(_.get(metrics, '[0].tagkv'), item => ({ label: item.tagk, value: item.tagk }));

    return (
      <div>
        <FormItem
          labelCol={{ span: 3 }}
          wrapperCol={{ span: 21 }}
          label={<FormattedMessage id="host.is.related" />}
          style={{ marginBottom: 5 }}
          // required
        >
          <Radio.Group
            value={metricObj.endpointsKey}
            onChange={e => this.handleEndpointsKeyChange(e.target.value, metricObj)}
          >
            <Radio value="endpoints"><FormattedMessage id="host.related" /></Radio>
            <Radio value="nids"><FormattedMessage id="host.unRelated" /></Radio>
          </Radio.Group>
        </FormItem>
        <FormItem
          labelCol={{ span: 3 }}
          wrapperCol={{ span: 21 }}
          label={<FormattedMessage id="graph.config.node" />}
          style={{ marginBottom: 5 }}
          // required
        >
          <TreeSelect
            multiple={metricObj.endpointsKey === 'nids'}
            showSearch
            allowClear
            treeDefaultExpandedKeys={_.map(treeDefaultExpandedKeys, _.toString)}
            treeNodeFilterProp="title"
            treeNodeLabelProp="path"
            dropdownStyle={{ maxHeight: 200, overflow: 'auto' }}
            value={metricObj.selectedNid || _.get(this.context, 'data.selectedNode.id')}
            onChange={value => this.handleNsChange(value, metricObj)}
            filterTreeNode={(inputValue, treeNode) => {
              return _.includes(treeNode.props.path, inputValue);
            }}
          >
            {renderTreeNodes(this.state.treeData, 'treeSelect')}
          </TreeSelect>
        </FormItem>
        {
          metricObj.endpointsKey === 'endpoints' ?
            <Tagkv
              type="modal"
              data={[{
                tagk: 'endpoint',
                tagv: metricObj.endpoints,
              }]}
              selectedTagkv={[{
                tagk: 'endpoint',
                tagv: metricObj.selectedEndpoint,
              }]}
              onChange={(tagk, tagv) => { this.handleEndpointChange(tagv); }}
              renderItem={(tagk, tagv, selectedTagv, show) => {
                return (
                  <Input
                    readOnly
                    value={_.join(_.slice(selectedTagv, 0, 40), ', ')}
                    size="default"
                    // placeholder="若无此 tag，请留空"
                    onClick={() => {
                      show(tagk);
                    }}
                  />
                );
              }}
              wrapInner={(content, tagk) => {
                return (
                  <FormItem
                    key={tagk}
                    labelCol={{ span: 3 }}
                    wrapperCol={{ span: 21 }}
                    label={tagk === 'nids' ? '节点路径' : tagk}
                    style={{ marginBottom: 5 }}
                    className="graph-tags"
                    required
                  >
                    {content}
                  </FormItem>
                );
              }}
            /> : null
        }
        <FormItem
          labelCol={{ span: 3 }}
          wrapperCol={{ span: 21 }}
          label={<FormattedMessage id="graph.config.metric" />}
          style={{ marginBottom: 5 }}
          required
        >
          <Select
            showSearch
            size="default"
            style={{ width: '100%' }}
            // placeholder="监控项指标名, 如cpu.idle"
            // notFoundContent="请输入关键词过滤"
            className="select-metric"
            value={metricObj.selectedMetric}
            onChange={value => this.handleMetricChange(value, currentMetric)}
          >
            {
              _.map(metricObj.metrics, o => <Option key={o}>{o}</Option>)
            }
          </Select>
        </FormItem>
        <Row style={{ marginBottom: 5 }}>
          <Col span={12}>
            <FormItem
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
              label={<FormattedMessage id="graph.config.aggr" />}
              style={{ marginBottom: 0 }}
              required={_.get(chartTypeOptions, 'chartType') === 'singleValue'}
            >
              <Select
                allowClear
                size="default"
                style={{ width: '100%' }}
                // placeholder="无"
                value={metricObj.aggrFunc}
                onChange={val => this.handleAggregateChange(currentMetric, val)}
              >
                <Option value="sum"><FormattedMessage id="graph.config.aggr.sum" /></Option>
                <Option value="avg"><FormattedMessage id="graph.config.aggr.avg" /></Option>
                <Option value="max"><FormattedMessage id="graph.config.aggr.max" /></Option>
                <Option value="min"><FormattedMessage id="graph.config.aggr.min" /></Option>
              </Select>
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 19 }}
              label={<FormattedMessage id="graph.config.aggr.group" />}
              style={{ marginBottom: 0 }}
            >
              <Select
                mode="multiple"
                size="default"
                style={{ width: '100%' }}
                disabled={!metricObj.aggrFunc}
                // placeholder="无"
                value={metricObj.aggrGroup || []}
                onChange={val => this.handleAggregateDimensionChange(currentMetric, val)}
              >
                {
                  _.map(aggrGroupOptions, o => <Option key={o.value} value={o.value}>{o.label}</Option>)
                }
              </Select>
            </FormItem>
          </Col>
        </Row>
        <Tagkv
          type="modal"
          data={withoutEndpointTagkv}
          selectedTagkv={metricObj.selectedTagkv}
          onChange={(tagk, tagv) => { this.handleTagkvChange(currentMetric, tagk, tagv); }}
          renderItem={(tagk, tagv, selectedTagv, show) => {
            return (
              <Input
                readOnly
                value={_.join(_.slice(selectedTagv, 0, 40), ', ')}
                size="default"
                // placeholder="若无此tag，请留空"
                onClick={() => {
                  show(tagk);
                }}
              />
            );
          }}
          wrapInner={(content, tagk) => {
            return (
              <FormItem
                key={tagk}
                labelCol={{ span: 3 }}
                wrapperCol={{ span: 21 }}
                label={tagk}
                style={{ marginBottom: 5 }}
                className="graph-tags"
                required
              >
                {content}
              </FormItem>
            );
          }}
        />
        <FormItem
          labelCol={{ span: 3 }}
          wrapperCol={{ span: 21 }}
          label={<FormattedMessage id="graph.config.series" />}
          style={{ marginBottom: 5 }}
        >
          <span style={{ color: '#ff7f00', paddingRight: 5 }}>
            {/* {_.get(metricObj.counterList, 'length')} */}
            {metricObj.counterListCount}
            <FormattedMessage id="graph.config.series.unit" />
          </span>
          <a onClick={() => {
            this.setState({ counterListVisible: !this.state.counterListVisible });
          }}>
            <Icon type={
              this.state.counterListVisible ? 'circle-o-up' : 'circle-o-down'
            } />
          </a>
          {
            this.state.counterListVisible &&
            <Table
              bordered={false}
              size="middle"
              columns={this.getColumns(metricObj)}
              dataSource={metricObj.counterList}
              locale={{
                emptyText: metricObj.tableEmptyText,
              }}
            />
          }
        </FormItem>
      </div>
    );
  }

  render() {
    const { loading, graphConfig } = this.state;
    const { now, start, end } = graphConfig;
    const timeVal = now === end ? getTimeLabelVal(start, end, 'value') : 'custom';
    const datePickerStartVal = moment(Number(start)).format(config.timeFormatMap.moment);
    const datePickerEndVal = moment(Number(end)).format(config.timeFormatMap.moment);

    return (
      <Spin spinning={loading}>
        <Form>
          {
            this.props.isScreen ?
              <FormItem
                labelCol={{ span: 3 }}
                wrapperCol={{ span: 21 }}
                label={<FormattedMessage id="graph.config.cate" />}
                style={{ marginBottom: 5 }}
                required
              >
                <Select
                  style={{ width: '100%' }}
                  value={graphConfig.subclassId}
                  onChange={this.handleSubclassChange}
                >
                  {
                    _.map(this.props.subclassOptions, (option) => {
                      return <Option key={option.id} value={option.id}>{option.name}</Option>;
                    })
                  }
                </Select>
              </FormItem> : null
          }
          <FormItem
            labelCol={{ span: 3 }}
            wrapperCol={{ span: 21 }}
            label={<FormattedMessage id="graph.config.graph.title" />}
            style={{ marginBottom: 5 }}
          >
            <Input
              style={{ width: '100%' }}
              value={graphConfig.title}
              onChange={this.handleTitleChange}
              placeholder="The metric name as the default title"
            />
          </FormItem>
          <FormItem
            labelCol={{ span: 3 }}
            wrapperCol={{ span: 21 }}
            label={<FormattedMessage id="graph.config.time" />}
            style={{ marginTop: 5, marginBottom: 0 }}
            required
            >
            <Select size="default" style={
              timeVal === 'custom' ?
                {
                  width: 169,
                  marginRight: 10,
                } : {
                  width: '100%',
                }
            }
              value={timeVal}
              onChange={this.handleTimeOptionChange}
            >
              {
                _.map(config.time, o => <Option key={o.value} value={o.value}><FormattedMessage id={o.label} /></Option>)
              }
            </Select>
            {
              timeVal === 'custom' ?
                [
                  <DateInput key="datePickerStart"
                    format={config.timeFormatMap.antd}
                    style={{
                      position: 'relative',
                      width: 120,
                    }}
                    value={datePickerStartVal}
                    onChange={d => this.handleDateChange('start', d)}
                  />,
                  <span key="datePickerDivider" style={{ paddingLeft: 10, paddingRight: 10 }}>-</span>,
                  <DateInput key="datePickerEnd"
                    format={config.timeFormatMap.antd}
                    style={{
                      position: 'relative',
                      width: 120,
                    }}
                    value={datePickerEndVal}
                    onChange={d => this.handleDateChange('end', d)}
                  />,
                ] : false
            }
          </FormItem>
          <FormItem
            labelCol={{ span: 3 }}
            wrapperCol={{ span: 21 }}
            label={<FormattedMessage id="graph.config.comparison" />}
            style={{ marginBottom: 0 }}
            >
            <Comparison
              size="default"
              comparison={graphConfig.comparison}
              relativeTimeComparison={graphConfig.relativeTimeComparison}
              comparisonOptions={graphConfig.comparisonOptions}
              graphConfig={graphConfig}
              onChange={(values) => {
                this.handleCommonFieldChange({
                  start: values.start,
                  end: values.end,
                  now: values.now,
                  comparison: values.comparison,
                  relativeTimeComparison: values.relativeTimeComparison,
                  comparisonOptions: values.comparisonOptions,
                });
              }}
            />
          </FormItem>
          {this.renderMetrics()}
          <FormItem
            labelCol={{ span: 3 }}
            wrapperCol={{ span: 21 }}
            label={<FormattedMessage id="graph.config.threshold" />}
            style={{ marginBottom: 5 }}
          >
            <InputNumber
              style={{ width: '100%' }}
              value={graphConfig.threshold}
              onChange={this.handleThresholdChange}
            />
          </FormItem>
          <FormItem
            labelCol={{ span: 3 }}
            wrapperCol={{ span: 21 }}
            label={<FormattedMessage id="graph.config.link" />}
            style={{ marginBottom: 5 }}
          >
            <Input
              style={{ width: '100%' }}
              value={graphConfig.link}
              onChange={this.linkChange}
              placeholder="自定义链接，方便跳转到更深层的大盘、临时图、报警策略等"
            />
          </FormItem>
        </Form>
      </Spin>
    );
  }
}

export default GraphConfigForm;
