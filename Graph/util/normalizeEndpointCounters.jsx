import _ from 'lodash';

export function transformMsToS(ts) {
  return Number(ts.substring(0, ts.length - 3));
}

export function processComparison(comparison) {
  const newComparison = [0];
  _.each(comparison, (o) => {
    newComparison.push(transformMsToS(o));
  });
  return newComparison;
}

export default function normalizeEndpointCounters(graphConfig, counterList) {
  const newComparison = processComparison(graphConfig.comparison);
  const firstMetric = _.get(graphConfig, 'metrics[0]', {});
  const { aggrFunc, aggrGroup: groupKey } = firstMetric;
  const start = transformMsToS(_.toString(graphConfig.start));
  const end = transformMsToS(_.toString(graphConfig.end));

  const counters = _.map(counterList, (counter) => {
    return {
      ...counter,
      start,
      end,
      aggrFunc,
      groupKey,
      consolFuc: 'AVERAGE',
      comparisons: newComparison,
    };
  });

  return counters;
}
