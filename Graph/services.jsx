/* eslint-disable no-return-await */
/* eslint-disable no-return-assign */
/* eslint-disable no-unused-vars */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-plusplus */
import _ from 'lodash';
import request from '../request';
import api from '../api';
import hasDtag from './util/hasDtag';
import getDTagV, { dFilter } from './util/getDTagV';
import processResData from './util/processResData';

function getDTagvKeyword(firstTagv) {
  if (firstTagv === '=all') {
    return '=all';
  }
  if (firstTagv.indexOf('=+') === 0) {
    return '=+';
  }
  if (firstTagv.indexOf('=-') === 0) {
    return '=-';
  }
  return undefined;
}

export function fetchEndPoints(nid) {
  return request({
    url: `${api.node}/${nid}/resources?limit=5000`,
  }, false).then((data) => {
    return data.list;
  });
}

function normalizeEndpoints(endpoints) {
  if (endpoints) {
    endpoints = _.isArray(endpoints) ? endpoints : [endpoints];
    return _.map(endpoints, item => _.toString(item));
  }
  return undefined;
}

export function fetchMetrics(selectedEndpoint, endpoints, endpointsKey = 'endpoints') {
  if (hasDtag(selectedEndpoint)) {
    const dTagvKeyword = getDTagvKeyword(selectedEndpoint[0]);
    selectedEndpoint = dFilter(dTagvKeyword, selectedEndpoint[0], endpoints);
  }
  return request(endpointsKey === 'endpoints' ? api.metrics : api.metricsPods, {
    method: 'POST',
    body: JSON.stringify({
      [endpointsKey]: normalizeEndpoints(selectedEndpoint),
    }),
  }).then((data) => {
    return _.chain(data.metrics).flattenDeep().union().sortBy((o) => {
      return _.lowerCase(o);
    }).value();
  });
}

export function fetchTagkv(selectedEndpoint, selectedMetric, endpoints, endpointsKey = 'endpoints') {
  if (hasDtag(selectedEndpoint)) {
    const dTagvKeyword = getDTagvKeyword(selectedEndpoint[0]);
    selectedEndpoint = dFilter(dTagvKeyword, selectedEndpoint[0], endpoints);
  }
  if (_.isEmpty(selectedEndpoint)) {
    return Promise.reject(new Error('No data'));
  }
  return request(endpointsKey === 'endpoints' ? api.tagkv : api.tagkvPods, {
    method: 'POST',
    body: JSON.stringify({
      [endpointsKey]: normalizeEndpoints(selectedEndpoint),
      metrics: _.isArray(selectedMetric) ? selectedMetric : [selectedMetric],
    }),
  }, false).then((data) => {
    let allTagkv = [];
    _.each(data, (item) => {
      const { tagkv } = item;
      allTagkv = [
        {
          tagk: endpointsKey === 'endpoints' ? 'endpoint' : 'nids',
          tagv: endpointsKey === 'endpoints' ? item.endpoints : item.nids,
        },
        ...tagkv || [],
      ];
    });
    return allTagkv;
  });
}

export function fetchCounter(queryBody) {
  return request(api.fullmatch, {
    method: 'POST',
    body: JSON.stringify(queryBody),
  }, false);
}

export async function normalizeMetrics(metrics, graphConfigInnerVisible, xhrs = []) {
  const metricsClone = _.cloneDeep(metrics);
  let canUpdate = false;

  for (let m = 0; m < metricsClone.length; m++) {
    const { selectedEndpoint, selectedNid, selectedMetric, selectedTagkv, tagkv, endpointsKey = 'endpoints' } = metricsClone[m];
    let { selectedEndpoint: endpoints } = metricsClone[m];
    // 加载 tagkv 规则，满足
    // 开启行级配置 或者 包含动态tag 或者 没有选择tag
    if (
      _.isEmpty(tagkv) &&
      (!!graphConfigInnerVisible || hasDtag(selectedTagkv) || _.isEmpty(selectedTagkv))
    ) {
      canUpdate = true;
      if (hasDtag(selectedEndpoint)) {
        endpoints = await fetchEndPoints(selectedNid);
        endpoints = _.map(endpoints, 'ident');
      }
      const newTagkv = await fetchTagkv(_.isEmpty(selectedEndpoint) ? [_.toString(selectedNid)] : selectedEndpoint, selectedMetric, endpoints, endpointsKey);
      const nids = _.get(_.find(newTagkv, { tagk: 'nids' }), 'tagv', []);

      metricsClone[m].tagkv = newTagkv;
      metricsClone[m].endpoints = endpointsKey === 'endpoints' ? endpoints : nids;
      metricsClone[m].selectedEndpoint = endpointsKey === 'endpoints' ? endpoints : nids;
      if (_.isEmpty(selectedTagkv)) {
        metricsClone[m].selectedTagkv = newTagkv;
      }
    }
  }
  return {
    metrics: metricsClone,
    canUpdate,
  };
}

export async function fetchCounterList(metrics, xhrs = []) {
  const queryBody = [];

  for (let m = 0; m < metrics.length; m++) {
    const { selectedMetric, selectedTagkv, selectedNid, tagkv, endpoints, endpointsKey = 'endpoints' } = metrics[m];
    let { selectedEndpoint } = metrics[m];

    if (hasDtag(selectedEndpoint)) {
      const dTagvKeyword = getDTagvKeyword(selectedEndpoint[0]);
      selectedEndpoint = dFilter(dTagvKeyword, selectedEndpoint[0], endpoints);
    }

    let newSelectedTagkv = selectedTagkv;

    // 动态tag场景
    if (hasDtag(selectedTagkv)) {
      newSelectedTagkv = _.map(newSelectedTagkv, (item) => {
        return {
          tagk: item.tagk,
          tagv: getDTagV(tagkv, item),
        };
      });
    }

    const excludeEndPoints = _.filter(newSelectedTagkv, (item) => {
      return item.tagk !== 'endpoint' && item.tagk !== 'nids';
    });

    queryBody.push({
      [endpointsKey]: normalizeEndpoints(selectedEndpoint),
      metric: selectedMetric,
      tagkv: excludeEndPoints,
    });
  }

  return await fetchCounter(queryBody, xhrs = []);
}

export function fetchHistory(endpointCounters, xhrs = []) {
  return request(api.points, {
    method: 'POST',
    body: JSON.stringify(endpointCounters),
  }, false).then((data) => {
    return processResData(data);
  });
}

export async function getHistory(endpointCounters, xhrs = []) {
  let sourceData = [];
  let i = 0;
  for (i; i < endpointCounters.length; i++) {
    // eslint-disable-next-line no-await-in-loop
    const data = await fetchHistory(endpointCounters[i]);
    if (data) {
      sourceData = _.concat(sourceData, data);
    }
  }
  return sourceData;
}
