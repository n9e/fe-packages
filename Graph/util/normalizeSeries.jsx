/* eslint-disable no-use-before-define */
import _ from 'lodash';
import { hexPalette } from '../config';

export default function normalizeSeries(data, treeData) {
  const series = [];
  _.each(_.sortBy(data, ['counter', 'endpoint']), (o, i) => {
    const { comparison, nid } = o;
    let { endpoint } = o;
    const color = getSerieColor(o, i);
    const separatorIdx = o.counter.indexOf('/');

    let counter = endpoint ? '' : o.counter;
    if (separatorIdx > -1) {
      counter = `${o.counter.substring(o.counter.indexOf('/') + 1)}`;
    }

    if (nid) {
      endpoint = `${_.get(_.find(treeData, { id: _.toNumber(nid) }), 'path')}`;
    }

    const id = `${endpoint} ${counter}`;
    const serie = {
      id,
      name: id,
      tags: id,
      data: o.values,
      lineWidth: 2,
      color,
      oldColor: color,
      comparison,
    };
    series.push(serie);
  });

  return series;
}

function getSerieColor(serie, serieIndex, isComparison) {
  const { comparison } = serie;
  let color;
  // 同环比固定曲线颜色
  if (isComparison && !comparison) {
    // 今天绿色
    color = 'rgb(67, 150, 30)';
  } else if (comparison === 86400) {
    // 昨天蓝色
    color = 'rgb(98, 127, 202)';
  } else if (comparison === 604800) {
    // 上周红色
    color = 'rgb(238, 92, 90)';
  } else {
    const colorIndex = serieIndex % hexPalette.length;
    color = hexPalette[colorIndex];
  }

  return color;
}
