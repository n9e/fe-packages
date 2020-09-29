import _ from 'lodash';

export default function hasDtag(data = []) {
  const DtagKws = ['=all', '=+', '=-'];
  // eslint-disable-next-line consistent-return
  return _.some(data, (item) => {
    if (_.isObject(item) && _.isArray(item.tagv)) {
      return hasDtag(item.tagv);
    }
    if (_.isString(item)) {
      return _.some(DtagKws, (o) => {
        return item.indexOf(o) === 0;
      });
    }
  });
}
