import _ from 'lodash';

export function dFilter(dType, firstTagv, currentTagv) {
  const dValue = firstTagv.replace(dType, '');
  const reg = new RegExp(dValue);
  return _.filter(currentTagv, (o) => {
    if (dType === '=all') {
      return true;
    }
    if (dType === '=+') {
      return reg.test(o);
    }
    if (dType === '=-') {
      return !reg.test(o);
    }
    return false;
  });
}

export default function getDTagV(tagkvs, tag) {
  const { tagk, tagv = [''] } = tag;
  const currentTagkv = _.find(tagkvs, { tagk }) || {};
  const currentTagv = currentTagkv.tagv || [];
  let newTagv = tagv;
  const firstTagv = tagv[0] || '';
  if (firstTagv.indexOf('=all') === 0) {
    newTagv = currentTagv;
    // if (_.includes(currentTagv, '<all>')) {
    //   // 动态全选排除<all>
    //   newTagv = _.filter(currentTagv, o => o !== '<all>');
    // } else {
    //   newTagv = currentTagv;
    // }
  } else if (firstTagv.indexOf('=+') === 0) {
    newTagv = dFilter('=+', firstTagv, currentTagv);
  } else if (firstTagv.indexOf('=-') === 0) {
    newTagv = dFilter('=-', firstTagv, currentTagv);
  }
  return newTagv;
}
