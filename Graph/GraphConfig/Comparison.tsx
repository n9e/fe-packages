/**
 * 环比组件
 * 会更新 endTime, 防止最近一小时 & 相对时间环比一小时数据可粒度正确
 */
import React, { Component } from 'react';
import _ from 'lodash';
import moment from 'moment';
import { FormattedMessage } from 'react-intl';
import { Icon, Button, Select, Popover, Input, InputNumber } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';

interface Props {
  size: 'small' | 'default' | 'large' | undefined,
  comparison: string[],
  relativeTimeComparison: boolean,
  comparisonOptions: any[],
  graphConfig: any,
  onChange: (values: any) => void,
}

interface State {
  customValue?: number,
  customType: string,
  errorText: string,
}

const Option = Select.Option;
const customTypeOptions = [
  {
    value: 'hour',
    label: '小时',
    ms: 3600000,
  }, {
    value: 'day',
    label: '天',
    ms: 86400000,
  },
];

export default class Comparison extends Component<Props, State> {
  static defaultProps = {
    size: 'small',
    comparison: [],
    relativeTimeComparison: false,
    comparisonOptions: [],
    graphConfig: null,
    onChange: _.noop,
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      customValue: undefined, // 自定义环比值(不带单位)
      customType: 'hour', // 自定义环比值单位 hour | day
      errorText: '', // 错误提示文本
    };
  }

  refresh = () => {
    const { graphConfig } = this.props;
    if (graphConfig) {
      const now = moment();
      const start = (Number(now.format('x')) - Number(graphConfig.end)) + Number(graphConfig.start) + '';
      const end = now.format('x');

      return { now: end, start, end };
    }
    return {};
  }

  handleComparisonChange = (value: string[]) => {
    const { onChange, relativeTimeComparison, comparisonOptions } = this.props;
    onChange({
      ...this.refresh(),
      comparison: value,
      relativeTimeComparison,
      comparisonOptions,
    });
  }

  handleRelativeTimeComparisonChange = (e: CheckboxChangeEvent) => {
    const { onChange, comparison, comparisonOptions } = this.props;
    onChange({
      ...this.refresh(),
      comparison,
      relativeTimeComparison: e.target.checked,
      comparisonOptions,
    });
  }

  handleCustomValueChange = (value: number | undefined) => {
    if (value) {
      this.setState({
        customValue: value,
        errorText: '',
      });
    } else {
      this.setState({
        customValue: value,
        errorText: '自定义值不能为空',
      });
    }
  }

  handleCustomTypeChange = (value: string) => {
    this.setState({ customType: value });
  }

  handleCustomBtnClick = () => {
    const { onChange, comparison, relativeTimeComparison, comparisonOptions } = this.props;
    const { customValue, customType } = this.state;
    const currentCustomTypeObj = _.find(customTypeOptions, { value: customType });

    if (!customValue || !currentCustomTypeObj) {
      this.setState({
        errorText: '自定义值不能为空',
      });
    } else {
      this.setState({
        errorText: '',
      }, () => {
        const ms = currentCustomTypeObj.ms * customValue;
        const comparisonOptionsClone = _.cloneDeep(comparisonOptions);
        const comparisonClone = _.cloneDeep(comparison);
        comparisonClone.push(_.toString(ms));
        comparisonOptionsClone.push({
          label: `${customValue}${currentCustomTypeObj.label}`,
          value: _.toString(ms),
        });
        const newComparisonOptions = _.unionBy(comparisonOptionsClone, 'value');
        onChange({
          ...this.refresh(),
          comparison: comparisonClone,
          relativeTimeComparison,
          comparisonOptions: newComparisonOptions,
        });
      });
    }
  }

  render() {
    const { size, comparison, relativeTimeComparison, comparisonOptions } = this.props;
    const { customValue, customType, errorText } = this.state;
    const addonUid = _.uniqueId('inputNumber-addon-');
    return (
      <div className="graph-config-inner-comparison">
        <Select
          dropdownMatchSelectWidth={false}
          mode="multiple"
          // placeholder="无"
          size={size}
          style={{ minWidth: 80, width: 'auto', verticalAlign: 'middle' }}
          value={comparison}
          onChange={this.handleComparisonChange}>
          {
            _.map(comparisonOptions, o => <Option key={o.value} value={o.value}><FormattedMessage id={o.label} /></Option>)
          }
        </Select>
        <Popover placement="bottom" title="Input coustom value" trigger="click" content={
          <div>
            <div style={{ display: 'inline-block', width: 160, marginRight: 10, verticalAlign: 'top' }}>
              <Input.Group className="ant-select-wrapper" size="default">
                <InputNumber value={customValue} onChange={this.handleCustomValueChange} />
                <span className="ant-input-group-addon" id={addonUid}>
                  <Select
                    style={{ width: 70 }}
                    getPopupContainer={() => document.getElementById(addonUid) as HTMLElement}
                    value={customType}
                    onChange={this.handleCustomTypeChange}
                  >
                    {
                      _.map(customTypeOptions, item => (
                        <Option key={item.value}>
                          <FormattedMessage id={item.label} />
                        </Option>
                      ))
                    }
                  </Select>
                </span>
              </Input.Group>
            </div>
            <Button onClick={this.handleCustomBtnClick}>OK</Button>
            <p style={{ color: '#f50' }}>{errorText}</p>
          </div>
        }>
          <span className="ant-input-group-addon select-addon" style={{
            padding: size === 'default' ? 7 : 5,
            left: size === 'default' ? -5 : -3,
            height: size === 'default' ? 32 : 24,
            lineHeight: size === 'default' ? '18px' : '10px',
          }}>
            <Icon type="plus-circle-o" />
          </span>
        </Popover>
        {/* <Checkbox
          style={{ marginLeft: 5, display: !_.isEmpty(comparison) ? 'inline' : 'none' }}
          checked={!!relativeTimeComparison}
          onChange={this.handleRelativeTimeComparisonChange}
        >
          相对时间环比 <Tooltip overlayClassName="largeTooltip" title={
            <div>
              <div>勾选后，图表的开始时刻为设定环比时段的起始时刻。</div>
              <div>例如，当前时刻为8:00，选择时段为1小时，环比时段为1小时，则图表的开始时刻为6:00（8-1-1）</div>
              <div>否则，图表的范围是0点～24点。</div>
            </div>
          }>
            <Icon type="info-circle-o" />
          </Tooltip>
        </Checkbox> */}
      </div>
    );
  }
}
