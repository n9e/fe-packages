import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import SolidGauge from '../../Charts/SolidGauge';
import LiquidFillGauge from '../../Charts/LiquidFillGauge';

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

const containerStyle = {
  textAlign: 'center',
  position: 'absolute',
  top: '50%',
  width: '100%',
};

export default function SingleValueChart(props) {
  const { chartTypeOptions, threshold } = props.graphConfig;
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (props.series.length) {
      let endpointValue = 0;
      _.forEach(props.series, (serie) => {
        if (chartTypeOptions.targetValue === 'current') {
          // 取倒数第二个点，防止可能出现最后一个点是 null
          endpointValue += _.get(serie.data[serie.data.length - 2], '1');
        } else if (chartTypeOptions.targetValue === 'max') {
          const result = _.maxBy(serie.data, '1');
          if (result) endpointValue += result[1];
        } else if (chartTypeOptions.targetValue === 'min') {
          const result = _.minBy(serie.data, '1');
          if (result) endpointValue += result[1];
        } else if (chartTypeOptions.targetValue === 'avg') {
          const result = _.sumBy(serie.data, '1');
          if (result) endpointValue += result / serie.data.length;
        }
      });
      if (threshold) {
        setValue(endpointValue / threshold * 100);
      } else {
        setValue(endpointValue);
      }
    }
  }, [props.series, chartTypeOptions]);

  const color = getFieldValueOfMapConf('color', value, chartTypeOptions.mapConf, chartTypeOptions.valueMap);
  const text = getFieldValueOfMapConf('text', value, chartTypeOptions.mapConf, chartTypeOptions.valueMap);

  if (props.series.length) {
    if (chartTypeOptions.subType === 'solidGauge') {
      return (
        <div style={{ ...containerStyle, marginTop: '-60px' }}>
          <SolidGauge
            value={value}
            color={color}
            valueUnit="%"
            style={{ display: 'inline-block' }}
          />
        </div>
      );
    }
    if (chartTypeOptions.subType === 'liquidFillGauge') {
      return (
        <div style={{ ...containerStyle, marginTop: '-60px' }}>
          <LiquidFillGauge
            value={value}
            settings={{
              textSize: 0.8,
              circleColor: color,
              waveColor: color,
              textColor: '#000',
              waveTextColor: '#FFF',
            }}
          />
        </div>
      );
    }
    return (
      <div style={{ ...containerStyle, marginTop: '-20px' }}>
        <strong style={{ color, fontSize: 24, paddingRight: 5 }}>
          {text || value.toFixed(3)}
        </strong>
        { !text ? chartTypeOptions.suffix : '' }
      </div>
    );
  }
  return null;
}
