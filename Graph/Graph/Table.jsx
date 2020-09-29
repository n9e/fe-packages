import React from 'react';
import { Table } from 'antd';
import _ from 'lodash';
import moment from 'moment';
import Legend from './Legend';

function getFieldValueOfMapConf(fieldName, value, mapConf, valueMap) {
  let fieldValue;
  _.forEach(mapConf, (item) => {
    if (valueMap === 'value') {
      if (item.value === value) {
        fieldValue = item[fieldName];
      }
    } else if (valueMap === 'range') {
      if (value >= item.from && value <= item.to) {
        fieldValue = item[fieldName];
      }
    }
  });
  return fieldValue;
}

export default function TableCpt(props) {
  const { series } = props;
  const { chartTypeOptions } = props.graphConfig;

  if (chartTypeOptions.tableType === 'stats') {
    return (
      <Legend
        style={{ display: 'block' }}
        graphConfig={props.graphConfig}
        series={series}
        rowSelection={null}
        columnsKey={chartTypeOptions.columnsKey}
        renderValue={(val) => {
          return (
            <span
              style={{
                color: getFieldValueOfMapConf('color', Number(val), chartTypeOptions.mapConf, chartTypeOptions.valueMap),
              }}
            >
              {getFieldValueOfMapConf('text', Number(val), chartTypeOptions.mapConf, chartTypeOptions.valueMap) || val}
            </span>
          );
        }}
        onChange={props.onChange}
      />
    );
  }
  if (chartTypeOptions.tableType === 'current') {
    const dataSource = [];

    _.forEach(series, (serie) => {
      _.forEach(serie.data, (point) => {
        dataSource.push({
          name: serie.name,
          ts: point[0],
          value: point[1],
        });
      });
    });

    return (
      <Table
        rowKey={record => record.name + record.ts}
        size="middle"
        pagination={false}
        className="auto-scroll-y"
        scroll={{ y: true }}
        dataSource={_.sortBy(dataSource, 'ts')}
        columns={[
          {
            title: 'time',
            dataIndex: 'ts',
            width: 165,
            render: (text) => {
              return moment(text).format('YYYY-MM-DD HH:mm:ss');
            },
          }, {
            title: 'series',
            dataIndex: 'name',
            width: 120,
          }, {
            title: 'value',
            dataIndex: 'value',
            width: 75,
            sorter: (a, b) => a.value - b.value,
            render: (text) => {
              if (_.isNumber(text)) {
                const val = text.toFixed(3);
                return (
                  <span
                    style={{
                      color: getFieldValueOfMapConf('color', Number(val), chartTypeOptions.mapConf, chartTypeOptions.valueMap),
                    }}
                  >
                    {getFieldValueOfMapConf('text', Number(val), chartTypeOptions.mapConf, chartTypeOptions.valueMap) || val}
                  </span>
                );
              }
              return 'null';
            },
          },
        ]}
      />
    );
  }
}
