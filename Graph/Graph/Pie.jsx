import React from 'react';
import _ from 'lodash';
import Pie from '../../Charts/Pie';

const containerStyle = {
  textAlign: 'center',
  position: 'absolute',
  top: '50%',
  width: '100%',
};

export default function PieCpt(props) {
  const { series } = props;
  const { chartTypeOptions } = props.graphConfig;
  const fanWidth = chartTypeOptions.pieType === 'pie' ? 0 : 30;
  const data = _.map(series, (serie) => {
    let endpointValue = 0;
    if (chartTypeOptions.targetValue === 'current') {
      endpointValue += serie.data[serie.data.length - 1];
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
    return {
      name: serie.name,
      value: endpointValue,
    };
  });

  return (
    <div style={{ ...containerStyle, marginTop: '-60px' }}>
      <Pie
        style={{ display: 'inline-block' }}
        fanWidth={fanWidth}
        data={data}
      />
    </div>
  );
}
