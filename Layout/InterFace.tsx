import React from 'react';
import { Icon } from 'antd';
import _ from 'lodash';
import classnames from 'classnames';
import { prefixCls } from './config';
import { isAbsolutePath } from './utils';

const cPrefixCls = `${prefixCls}-layout`;

const hasInterChildren = (menus: any): boolean => {
    let lock = false;
    menus.map((item: any) => {
      item?.misService?.length !== 0 && (lock = true)
    })
    return lock;
  }

export const renderInterfaceContentMenus = (menus: any[]) => {
  return hasInterChildren(menus) ? (
    _.map(menus, (menu) => {
      return (
        <dl
          key={menu.displayName}
          className={classnames({
            [`${cPrefixCls}-menus-content-menu-group`]: true,
            [`${cPrefixCls}-menus-content-menu-group-history`]:
              menu.displayName === '最近访问',
          })}
        >
          <dt className={`${cPrefixCls}-menus-content-menu-group-title`}>
            { menu.displayName}
          </dt>
          {_.map(menu.misService, (item) => {
            // const stared = !!_.find(stars, { name: item.displayName });
            return (
              <dd
                key={item.displayName}
                className={classnames({
                  [`${cPrefixCls}-menus-content-menu`]: true,
                //   [`${cPrefixCls}-menus-content-starMenu`]: stared,
                })}
              >
                <a
                  href={
                    isAbsolutePath(item.path) ? item.path : `/${item.applyUrl}`
                  }
                  target={item.target}
                //   onClick={() => {
                //     let newHistory = _.concat(item, historyList);
                //     let newArr = _.filter(newHistory, (item, index, arr) => {
                //       return _.findIndex(arr, item) === index;
                //     });
                //     setHistoryLocal(newArr);
                //   }}
                >
                  {item.displayName}
                </a>
                <Icon
                //   title={stared ? '取消收藏' : '添加收藏'}
                  type="star"
                  className={`${cPrefixCls}-menus-content-menu-star`}
                //   theme={stared ? 'filled' : 'outlined'}
                //   onClick={() => {
                //     let newStars;
                //     if (stared) {
                //       newStars = _.remove(stars, (star) => {
                //         return star.path !== item.path;
                //       });
                //     } else {
                //       newStars = _.concat(stars, item);
                //     }
                //     setLocal(newStars);
                //   }}
                />
              </dd>
            );
          })}
        </dl>
      );
    })
  ) : (
    <div style={{ color: '#333', fontSize: 14, marginTop: 20 }}>
      未找到与"<span style={{ color: '#FB4E57' }}>123</span>
      "相关的产品
    </div>
  );
};
