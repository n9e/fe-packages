/* eslint-disable react/sort-comp */
/* eslint-disable prefer-template */
/* eslint-disable react/no-string-refs */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-expressions */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Spin, Icon } from 'antd';
import moment from 'moment';
import _ from 'lodash';
import { sortableHandle } from 'react-sortable-hoc';
import '@d3-charts/ts-graph/dist/index.css';
import { NsTreeContext } from '../../Layout/Provider';
import * as config from '../config';
import * as util from '../util';
import * as services from '../services';
import Legend, { getSerieVisible, getSerieColor, getSerieIndex } from './Legend';
import Title from './Title';
import Extra from './Extra';
import GraphConfigInner from '../GraphConfig/GraphConfigInner';
import GraphChart from './Graph';
import SingleValueChart from './SingleValueChart';
import TableChart from './Table';
import PieChart from './Pie';

const DragHandle = sortableHandle(() => <Icon type="drag" style={{ cursor: 'move', color: '#999' }} />);

export default class Graph extends Component {
  static contextType = NsTreeContext;

  static propTypes = {
    data: PropTypes.shape({ // 图表数据配置
      ...config.graphPropTypes,
      id: PropTypes.number.isRequired,
    }).isRequired,
    isDidiMonitor: PropTypes.bool,
    // type: PropTypes.string, // 图表类型，目前只支持 chart | table
    height: PropTypes.number, // 图表高度
    // counterListLenForAvgAggr: PropTypes.number, // 触发默认聚合的 counter 数量，0 表示关闭该功能
    graphConfigInnerVisible: PropTypes.bool, // 内置图表配置栏是否显示
    extraRender: PropTypes.func, // 图表右侧工具栏扩展
    extraMoreList: PropTypes.node, // 图表右侧工具栏更多选项扩展
    metricMap: PropTypes.object, // 指标信息表，用于设置图表名称
    onChange: PropTypes.func, // 图表配置修改回调
    // onWillInit: PropTypes.func,
    // onDidInit: PropTypes.func,
    // onWillUpdate: PropTypes.func,
    // onDidUpdate: PropTypes.func,
    onOpenGraphConfig: PropTypes.func,
  };

  static defaultProps = {
    isDidiMonitor: false,
    // type: 'chart',
    height: 350,
    // counterListLenForAvgAggr: 2000,
    graphConfigInnerVisible: true,
    extraRender: undefined,
    extraMoreList: undefined,
    metricMap: undefined,
    onChange: _.noop,
    // onWillInit: _.noop,
    // onDidInit: _.noop,
    // onWillUpdate: _.noop,
    // onDidUpdate: _.noop,
    onOpenGraphConfig: _.noop,
  };

  counterListCount = 0;

  constructor(props) {
    super(props);
    this.xhrs = []; // 保存 xhr 实例，用于组件销毁的时候中断进行中的请求
    this.chartOptions = config.chart;
    this.headerHeight = 35;
    this.state = {
      spinning: false,
      errorText: '', // 异常场景下的文案
      series: [],
      forceRender: false,
    };
    this.counterList = [];
    this.series = [];
  }

  componentDidMount() {
    this.fetchData(this.props.data, true, () => {
      // this.initHighcharts(this.props, series);
    });
  }

  componentWillReceiveProps(nextProps) {
    const nextData = nextProps.data;
    const thisData = this.props.data;
    const selectedNsChanged = !util.isEqualBy(nextData.metrics, thisData.metrics, 'selectedNid');
    const selectedMetricChanged = !util.isEqualBy(nextData.metrics, thisData.metrics, 'selectedMetric');
    const selectedTagkvChanged = !util.isEqualBy(nextData.metrics, thisData.metrics, 'selectedTagkv');
    const tagkvChanged = !util.isEqualBy(nextData.metrics, thisData.metrics, 'tagkv');
    const aggrFuncChanged = !util.isEqualBy(nextData.metrics, thisData.metrics, 'aggrFunc');
    const aggrGroupChanged = !util.isEqualBy(nextData.metrics, thisData.metrics, 'aggrGroup');
    const timeChanged = nextData.start !== thisData.start || nextData.end !== thisData.end;

    // 重新加载数据并更新 series
    // 时间范围值、环比值、selectedTagkv值改变的时候需要重新加载数据
    if (
      timeChanged ||
      selectedNsChanged ||
      selectedMetricChanged ||
      selectedTagkvChanged ||
      tagkvChanged ||
      !_.isEqual(nextData.comparison, thisData.comparison) ||
      aggrFuncChanged ||
      aggrGroupChanged
    ) {
      const isFetchCounter = selectedNsChanged || selectedMetricChanged || selectedTagkvChanged || tagkvChanged;
      this.fetchData(nextProps.data, isFetchCounter, () => {
        // this.updateHighcharts('series', nextData, series);
      });
    } else if (
      // 只更新 chartOptions
      nextData.threshold !== thisData.threshold ||
      nextData.unit !== thisData.unit ||
      nextData.yAxisMax !== thisData.yAxisMax ||
      nextData.yAxisMin !== thisData.yAxisMin ||
      nextData.timezoneOffset !== thisData.timezoneOffset ||
      nextData.shared !== thisData.shared
    ) {
      // this.updateHighcharts('options', nextData);
    }
  }

  componentWillUnmount() {
    this.abortFetchData();
    this.chart && this.chart.destroy();
  }

  static setOptions = (options) => {
    window.OdinGraphOptions = options;
  };

  getGraphConfig(graphConfig) {
    return {
      ...config.graphDefaultConfig,
      ...graphConfig,
      // eslint-disable-next-line no-nested-ternary
      now: graphConfig.now ? graphConfig.now : graphConfig.end ? graphConfig.end : config.graphDefaultConfig.now,
    };
  }

  getZoomedSeries() {
    return this.state.series;
  }

  async fetchData(graphConfig, isFetchCounter) {
    graphConfig = this.getGraphConfig(graphConfig);

    this.abortFetchData();

    this.setState({ spinning: true });
    let { metrics } = graphConfig;
    let series = [];

    try {
      const metricsResult = await services.normalizeMetrics(metrics, this.props.graphConfigInnerVisible, this.xhrs);
      // eslint-disable-next-line prefer-destructuring
      metrics = metricsResult.metrics;

      if (metricsResult.canUpdate) {
        this.props.onChange('update', graphConfig.id, {
          metrics,
        });
        // 临时图场景，只是更新 tagkv, 这块需要再优化下
        // return;
      }
      if (isFetchCounter) {
        this.counterList = await services.fetchCounterList(metrics, this.xhrs).then((res) => {
          this.counterListCount = res.count;
          return res.list;
        });
      }

      const endpointCounters = util.normalizeEndpointCounters(graphConfig, this.counterList);
      const errorText = this.checkEndpointCounters(this.counterListCount, config.countersMaxLength);

      if (!errorText) {
        // get series
        const sourceData = await services.getHistory(endpointCounters, this.xhrs);
        const treeData = _.get(this.context, 'data.treeData');
        series = util.normalizeSeries(sourceData, treeData);
      }

      // cbk && cbk(this.series);
      this.setState({ errorText, spinning: false, series });
    } catch (e) {
      console.log(e);
      if (e.statusText === 'abort') return;

      let errorText = e.err;

      if (e.statusText === 'error') {
        errorText = 'The network has been disconnected, please check the network';
      } else if (e.statusText === 'Not Found') {
        errorText = '404 Not Found.';
      } else if (e.responseJSON) {
        errorText = _.get(e.responseJSON, 'msg', e.responseText);

        if (!errorText || e.status === 500) {
          errorText = 'Data loading exception, please refresh and reload';
        }

        // request entity too large
        if (e.status === 413) {
          errorText = 'Request condition is too large, please reduce the condition';
        }
      }

      this.setState({ errorText, spinning: false });
    }
  }

  checkEndpointCounters(counterListCount, countersMaxLength) {
    let errorText = '';
    if (counterListCount === 0) {
      errorText = 'No data';
    }

    if (counterListCount > countersMaxLength && !this.state.forceRender) {
      errorText = (
        <span className="counters-maxLength">
          返回的数据量太大，可能导致服务端OOM或浏览器崩溃。您可以通过tags筛选功能减少图表数量，
          <a
            onClick={() => {
              this.setState({ forceRender: true }, () => {
                this.fetchData(this.props.data, true);
              });
            }}
          >
            【我已了解风险，强制看图】
          </a>
        </span>
      );
    }

    return errorText;
  }

  abortFetchData() {
    _.each(this.xhrs, (xhr) => {
      _.isFunction(_.get(xhr, 'abort')) && xhr.abort();
    });
    this.xhrs = [];
  }

  // initHighcharts(props, series) {
  //   const graphConfig = this.getGraphConfig(props.data);
  //   const chartOptions = {
  //     timestamp: 'x',
  //     chart: {
  //       height: props.height,
  //       renderTo: this.refs.graphWrapEle,
  //     },
  //     xAxis: graphConfig.xAxis,
  //     yAxis: util.getYAxis({}, graphConfig),
  //     tooltip: {
  //       shared: graphConfig.shared,
  //       formatter: (points) => {
  //         return util.getTooltipsContent({
  //           points,
  //           chartWidth: this.refs.graphWrapEle.offsetWidth - 40,
  //         });
  //       },
  //     },
  //     series,
  //     legend: {
  //       enabled: false,
  //     },
  //     onZoom: (getZoomedSeries) => {
  //       this.getZoomedSeries = getZoomedSeries;
  //       this.forceUpdate();
  //     },
  //   };

  //   if (!this.chart) {
  //     this.props.onWillInit(chartOptions);
  //     this.chart = new D3Graph(chartOptions);
  //     this.props.onDidInit(this.chart, chartOptions);
  //   }
  // }

  // updateHighcharts(type, graphConfig = this.props.data, series = this.series) {
  //   if (!this.chart) {
  //     this.initHighcharts(this.props, series);
  //     return;
  //   }
  //   graphConfig = this.getGraphConfig(graphConfig);

  //   const updateChartOptions = {
  //     yAxis: util.getYAxis(this.chart.options.yAxis, graphConfig),
  //     tooltip: {
  //       xAxis: graphConfig.xAxis,
  //       shared: graphConfig.shared,
  //       formatter: (points) => {
  //         return util.getTooltipsContent({
  //           points,
  //           chartWidth: this.refs.graphWrapEle.offsetWidth - 40,
  //         });
  //       },
  //     },
  //     series,
  //   };

  //   this.props.onWillUpdate(this.chart, updateChartOptions);
  //   this.chart.update(updateChartOptions);
  //   this.props.onDidUpdate(this.chart, updateChartOptions);
  // }

  handleLegendRowSelectedChange = (selectedKeys, highlightedKeys) => {
    const { series } = this.state;

    const newSeries = _.map(series, (serie, i) => {
      const oldColor = _.get(serie, 'oldColor', serie.color);
      return {
        ...serie,
        visible: getSerieVisible(serie, selectedKeys),
        zIndex: getSerieIndex(serie, highlightedKeys, series.length, i),
        color: getSerieColor(serie, highlightedKeys, oldColor),
        oldColor,
      };
    });

    this.setState({ series: newSeries }, () => {
      // this.updateHighcharts();
    });
  }

  refresh = () => {
    const { data, onChange } = this.props;
    const now = moment();
    const start = (now.format('x') - Number(data.end)) + Number(data.start) + '';
    const end = now.format('x');

    onChange('update', data.id, {
      start, end, now: end,
    });
  }

  resize = () => {
    if (this.chart && this.chart.resizeHandle) {
      this.chart.resizeHandle();
    }
  }

  renderChart() {
    const { errorText, series } = this.state;
    const { height, data } = this.props;
    const graphConfig = this.getGraphConfig(data);
    const chartType = _.get(data, 'chartTypeOptions.chartType') || 'line';

    if (errorText) {
      return (
        <div className="graph-errorText">
          {errorText}
        </div>
      );
    }
    if (chartType === 'line') {
      return <GraphChart graphConfig={graphConfig} height={height} series={series} />;
    }
    if (chartType === 'singleValue') {
      return <SingleValueChart graphConfig={graphConfig} series={series} />;
    }
    if (chartType === 'table') {
      return <TableChart graphConfig={graphConfig} onChange={this.props.onChange} series={series} />;
    }
    if (chartType === 'pie') {
      return <PieChart graphConfig={graphConfig} series={series} />;
    }
    return null;
  }

  render() {
    const { spinning, isOrigin } = this.state;
    const { height, onChange, extraRender, data, isDidiMonitor } = this.props;
    const graphConfig = this.getGraphConfig(data);

    return (
      <div className={graphConfig.legend ? 'graph-container graph-container-hasLegend' : 'graph-container'}>
        <div
          className="graph-header"
          style={{
            height: this.headerHeight,
            lineHeight: `${this.headerHeight}px`,
            display: isDidiMonitor ? 'none' : 'block',
          }}
        >
          <div className="graph-extra">
            <div style={{ display: 'inline-block' }}>
              {
                this.props.useDragHandle ? <DragHandle /> : null
              }
              {
                graphConfig.linkVisible ?
                  <a
                    style={{ marginLeft: 8, color: graphConfig.link ? '#999' : '#ccc' }}
                    href={graphConfig.link}
                    disabled={!graphConfig.link}
                  >
                    <Icon type="link" />
                  </a> : null
              }
              {
                _.isFunction(extraRender) ?
                  extraRender(this) :
                  <Extra
                    graphConfig={graphConfig}
                    counterList={this.counterList}
                    onOpenGraphConfig={this.props.onOpenGraphConfig}
                    moreList={this.props.extraMoreList}
                  />
              }
            </div>
          </div>
          <Title
            title={data.title}
            selectedNs={_.reduce(graphConfig.metrics, (result, metricObj) => _.concat(result, metricObj.selectedNs), [])}
            selectedMetric={_.reduce(graphConfig.metrics, (result, metricObj) => _.concat(result, metricObj.selectedMetric), [])}
            metricMap={this.props.metricMap}
          />
        </div>
        {
          this.props.graphConfigInnerVisible ?
            <GraphConfigInner
              isOrigin={isOrigin}
              data={graphConfig}
              onChange={onChange}
            /> : null
        }
        <Spin spinning={spinning}>
          <div style={{ height }}>
            {this.renderChart()}
          </div>
          {/* <div style={{ height, display: !errorText ? 'none' : 'block' }}>
            {
              errorText ?
                <div className="graph-errorText">
                  {errorText}
                </div> :
                {
                  chartType === 'line' ?
                }
            }
          </div> */}
          {/* <div className="graph-content" ref="graphWrapEle"
            style={{
              height,
              backgroundColor: '#fff',
              display: errorText || (chartType && chartType !== 'graph') ? 'none' : 'block',
            }}
          />
          <div className="graph-content"
            style={{
              height,
              backgroundColor: '#fff',
              display: !errorText && chartType && chartType !== 'graph' ? 'block' : 'none',
            }}
          >
            111
          </div> */}
        </Spin>
        <Legend
          style={{ display: graphConfig.legend ? 'block' : 'none' }}
          graphConfig={graphConfig}
          series={this.getZoomedSeries()}
          onSelectedChange={this.handleLegendRowSelectedChange}
          comparisonOptions={graphConfig.comparisonOptions}
        />
      </div>
    );
  }
}
