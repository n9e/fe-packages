/* eslint-disable no-inner-declarations */
/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable react/jsx-one-expression-per-line */
/* eslint-disable react/prop-types */
import React from 'react';
import { Row, Col, Form, Select, Input, InputNumber, Radio, Icon } from 'antd';
import { FormattedMessage } from 'react-intl';
import { useDynamicList } from '@umijs/hooks';
import update from 'react-addons-update';
import _ from 'lodash';

const FormItem = Form.Item;
const { Option } = Select;

const mapConfItem = {
  value: undefined,
  from: undefined,
  to: undefined,
  color: undefined,
  text: undefined,
};

function renderMapCpt(data, onChange) {
  const { list, push, remove, replace } = useDynamicList(data.mapConf);

  function updateMapConf(index, obj) {
    replace(index, obj);
    onChange(update(data, {
      mapConf: {
        $splice: [
          [index, 1, obj],
        ],
      },
    }));
  }
  return (
    <>
      <Col span={24}>
        <FormItem
          labelCol={{ span: 3 }}
          wrapperCol={{ span: 21 }}
          label={<FormattedMessage id="graph.config.chartType.valueMap" />}
          style={{ marginBottom: 0 }}
        >
          <Radio.Group
            value={data.valueMap}
            onChange={(e) => {
              onChange({
                ...data,
                valueMap: e.target.value,
              });
            }}
          >
            <Radio value="range">range to map</Radio>
            <Radio value="value">value to map</Radio>
          </Radio.Group>
        </FormItem>
      </Col>
      <Col span={24}>
        <FormItem
          labelCol={{ span: 3 }}
          wrapperCol={{ span: 21 }}
          label={<FormattedMessage id="graph.config.chartType.mapConf" />}
          style={{ marginBottom: 0 }}
        >
          {
            _.map(list, (item, index) => {
              return (
                <div>
                  {
                    data.valueMap === 'range' ?
                      <span>
                        <span style={{ paddingRight: 20 }}>
                          From <InputNumber value={item.from} onChange={val => updateMapConf(index, { ...item, from: val })} />
                        </span>
                        <span style={{ paddingRight: 20 }}>
                          To <InputNumber value={item.to} onChange={val => updateMapConf(index, { ...item, to: val })} />
                        </span>
                      </span> :
                      <span style={{ paddingRight: 20 }}>
                        Value <InputNumber value={item.value} onChange={val => updateMapConf(index, { ...item, value: val })} />
                      </span>
                  }
                  <span style={{ paddingRight: 20 }}>
                    Color <Input type="color" style={{ width: 100 }} value={item.color} onChange={e => updateMapConf(index, { ...item, color: e.target.value })} />
                  </span>
                  <span style={{ paddingRight: 20 }}>
                    Text <Input style={{ width: 100 }} value={item.text} onChange={e => updateMapConf(index, { ...item, text: e.target.value })} />
                  </span>
                  {list.length > 1 && (
                    <Icon
                      type="minus-circle-o"
                      style={{ marginLeft: 8 }}
                      onClick={() => {
                        remove(index);
                      }}
                    />
                  )}
                  <Icon
                    type="plus-circle-o"
                    style={{ marginLeft: 8 }}
                    onClick={() => {
                      push(mapConfItem);
                    }}
                  />
                </div>
              );
            })
          }
        </FormItem>
      </Col>
    </>
  );
}

export default function ChartTypeForm(props) {
  const { data, onChange } = props;

  if (data) {
    if (data.chartType === 'singleValue') {
      return (
        <Form>
          <Row style={{ marginBottom: 5 }}>
            <Col span={8}>
              <FormItem
                labelCol={{ span: 9 }}
                wrapperCol={{ span: 15 }}
                label={<FormattedMessage id="graph.config.chartType.subType" />}
                style={{ marginBottom: 0 }}
              >
                <Select
                  size="default"
                  style={{ width: '100%' }}
                  value={data.subType}
                  onChange={(val) => {
                    onChange({
                      ...data,
                      subType: val,
                    });
                  }}
                >
                  <Option value="normal"><FormattedMessage id="graph.config.subType.normal" /></Option>
                  <Option value="solidGauge"><FormattedMessage id="graph.config.subType.solidGauge" /></Option>
                  <Option value="liquidFillGauge"><FormattedMessage id="graph.config.subType.liquidFillGauge" /></Option>
                </Select>
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem
                labelCol={{ span: 9 }}
                wrapperCol={{ span: 15 }}
                label={<FormattedMessage id="graph.config.chartType.targetValue" />}
                style={{ marginBottom: 0 }}
              >
                <Select
                  size="default"
                  style={{ width: '100%' }}
                  value={data.targetValue}
                  onChange={(val) => {
                    onChange({
                      ...data,
                      targetValue: val,
                    });
                  }}
                >
                  <Option value="current"><FormattedMessage id="graph.config.chartType.current" /></Option>
                  <Option value="avg"><FormattedMessage id="graph.config.aggr.avg" /></Option>
                  <Option value="max"><FormattedMessage id="graph.config.aggr.max" /></Option>
                  <Option value="min"><FormattedMessage id="graph.config.aggr.min" /></Option>
                </Select>
              </FormItem>
            </Col>
            {
              data.subType === 'normal' ?
                <Col span={8}>
                  <FormItem
                    labelCol={{ span: 9 }}
                    wrapperCol={{ span: 15 }}
                    label={<FormattedMessage id="graph.config.chartType.unit" />}
                    style={{ marginBottom: 0 }}
                  >
                    <Input
                      value={data.suffix}
                      onChange={(e) => {
                        onChange({
                          ...data,
                          suffix: e.target.value,
                        });
                      }}
                    />
                  </FormItem>
                </Col> : null
            }
            {renderMapCpt(data, onChange)}
          </Row>
        </Form>
      );
    }
    if (data.chartType === 'table') {
      return (
        <Form>
          <Row style={{ marginBottom: 5 }}>
            <Col span={24}>
              <FormItem
                labelCol={{ span: 3 }}
                wrapperCol={{ span: 21 }}
                label={<FormattedMessage id="graph.config.chartType.tableType" />}
                style={{ marginBottom: 0 }}
              >
                <Select
                  size="default"
                  style={{ width: '100%' }}
                  value={data.tableType}
                  onChange={(val) => {
                    onChange({
                      ...data,
                      tableType: val,
                    });
                  }}
                >
                  <Option value="current"><FormattedMessage id="graph.config.chartType.tableType.current" /></Option>
                  <Option value="stats"><FormattedMessage id="graph.config.chartType.tableType.stats" /></Option>
                </Select>
              </FormItem>
            </Col>
          </Row>
          {
            data.tableType === 'stats' ?
              <Row style={{ marginBottom: 5 }}>
                <Col span={24}>
                  <FormItem
                    labelCol={{ span: 3 }}
                    wrapperCol={{ span: 21 }}
                    label={<FormattedMessage id="graph.config.chartType.tableType.columnsKey" />}
                    style={{ marginBottom: 0 }}
                  >
                    <Select
                      size="default"
                      style={{ width: '100%' }}
                      mode="multiple"
                      value={data.columnsKey}
                      onChange={(val) => {
                        onChange({
                          ...data,
                          columnsKey: val,
                        });
                      }}
                    >
                      <Option value="max">Max</Option>
                      <Option value="min">Min</Option>
                      <Option value="avg">Avg</Option>
                      <Option value="sum">Sum</Option>
                      <Option value="last">Last</Option>
                    </Select>
                  </FormItem>
                </Col>
              </Row> : null
          }
          <Row>
            {renderMapCpt(data, onChange)}
          </Row>
        </Form>
      );
    }
    if (data.chartType === 'pie') {
      return (
        <Form>
          <Row style={{ marginBottom: 5 }}>
            <Col span={12}>
              <FormItem
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 18 }}
                label={<FormattedMessage id="graph.config.chartType.pieType" />}
                style={{ marginBottom: 0 }}
              >
                <Select
                  size="default"
                  style={{ width: '100%' }}
                  value={data.pieType}
                  onChange={(val) => {
                    onChange({
                      ...data,
                      pieType: val,
                    });
                  }}
                >
                  <Option value="pie"><FormattedMessage id="graph.config.chartType.pieType.pie" /></Option>
                  <Option value="donut"><FormattedMessage id="graph.config.chartType.pieType.donut" /></Option>
                </Select>
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 18 }}
                label={<FormattedMessage id="graph.config.chartType.targetValue" />}
                style={{ marginBottom: 0 }}
              >
                <Select
                  size="default"
                  style={{ width: '100%' }}
                  value={data.targetValue}
                  onChange={(val) => {
                    onChange({
                      ...data,
                      targetValue: val,
                    });
                  }}
                >
                  <Option value="current"><FormattedMessage id="graph.config.chartType.current" /></Option>
                  <Option value="avg"><FormattedMessage id="graph.config.aggr.avg" /></Option>
                  <Option value="max"><FormattedMessage id="graph.config.aggr.max" /></Option>
                  <Option value="min"><FormattedMessage id="graph.config.aggr.min" /></Option>
                </Select>
              </FormItem>
            </Col>
          </Row>
        </Form>
      );
    }
  }
  return null;
}
