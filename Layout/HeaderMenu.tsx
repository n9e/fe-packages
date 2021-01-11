import React, { useState, useEffect, useMemo } from 'react';
import { Layout, Icon, Input, Empty } from 'antd';
import _ from 'lodash';
import classnames from 'classnames';
import queryString from 'query-string';
import { getIntl } from '../hooks/useFormatMessage';
import { prefixCls } from './config';
import StarMenus from './StarMenus';
import { isAbsolutePath } from './utils';
import request from '@pkgs/request';
import api from '@pkgs/api';

const cPrefixCls = `${prefixCls}-layout`;
const { Sider, Content } = Layout;

export default function HeaderMenu(props: any) {
  const { locale } = getIntl();
  const [menus, setMenus] = useState([] as any);
  const [icon, setIcon] = useState(false);
  const { menusContentVsible, setMenusContentVisible, setMenusVisible } = props;
  const [queryParams, setQueryParams] = useState('');
  const [historyList, setHistoryList] = useState([]);
  const [complicated, setComplicated] = useState(false);
  const [accessToken] = useState(localStorage.getItem('accessToken') as string);
  const showMenus = useMemo(
    () =>
      menus
        .map((item: any) => ({
          ...item,
          children: item?.children?.filter(
            (item: any) => item.name.includes(queryParams) || !queryParams
          ),
        }))
        ?.filter((item: any) => item.children?.length > 0),
    [queryParams, menus]
  );

  const setLocal = (name: any) => {
    setStars(name);
    const jsonArrayString = JSON.stringify(name);
    localStorage.setItem('stars', jsonArrayString);
  };

  const setHistoryLocal = (name: any) => {
    setHistoryList(name);
    const jsonArrayString = JSON.stringify(name);
    localStorage.setItem('menusHistory', jsonArrayString);
  };

  const [stars, setStars] = useState([]);

  useEffect(() => {
    setHistoryList(historyList);
  }, [locale]);

  useEffect(() => {
    const cacheStars = localStorage.getItem('stars');
    const menusHistory = localStorage.getItem('menusHistory');
    let defaultStars = [];
    let defaultHistory = [];
    try {
      defaultStars = JSON.parse(cacheStars || '');
    } catch (e) {
      console.log('收藏菜单未缓存，或解析缓存数据失败');
    }
    try {
      defaultHistory = JSON.parse(menusHistory || '');
    } catch (e) {
      console.log('历史菜单未缓存，或解析缓存数据失败');
    }
    if (defaultStars.length) {
      setStars(defaultStars);
    }
    setHistoryList(historyList);

    if (defaultHistory.length) {
      setHistoryList(defaultHistory);
    }
    fetch('/static/feConfig.json')
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        if (res.header.mode === 'complicated') {
          request(`${api.menus}?onlyOnlineService=true`).then((res) => {
            const menus = res.map((item: any) => ({
              name: item.displayName,
              nameEn: item.code,
              children: item?.misService?.map((item: any) => ({
                name: item.displayName,
                path: item.applyUrl,
                nameEn: item.code,
                icon: item.picturePath,
              })),
            }));
            setComplicated(true);
            setMenus(menus);
          });
        } else {
          fetch('/static/menusConfig.json')
            .then((res) => {
              return res.json();
            })
            .then((res) => {
              setComplicated(false);
              setMenus(res);
            });
        }
      });
  }, []);
  const hasChildren = (menus: any): boolean => {
    let lock = false;
    menus.map((item: any) => {
      item?.children.length !== 0 && (lock = true);
    });
    return lock;
  };

  const renderContentMenus = (menus: any[]) => {
    return hasChildren(menus) ? _.map(menus, (menu) => {
      return (
        <dl
          key={menu.name}
          className={classnames({
            [`${cPrefixCls}-menus-content-menu-group`]: true,
            [`${cPrefixCls}-menus-content-menu-group-history`]:
              menu.name === '最近访问',
          })}
        >
          <dt className={`${cPrefixCls}-menus-content-menu-group-title`}>
            {locale === 'en' ? menu.nameEn : menu.name}
          </dt>
          {_.map(menu.children, (item) => {
            const stared = !!_.find(stars, { name: item.name });
            const query = queryString.parseUrl(item.path);
            _.set(query.query, 'token', accessToken)
            return (
              <dd
                key={item.name}
                className={classnames({
                  [`${cPrefixCls}-menus-content-menu`]: true,
                  [`${cPrefixCls}-menus-content-starMenu`]: stared,
                })}
              >
                <a
                  href={isAbsolutePath(item.path) ? `${query.url}?${queryString.stringify(query.query)}` : `/${item.path}`}
                  target={item.target}
                  onClick={() => {
                    let newHistory = _.concat(item, historyList);
                    let newArr = _.filter(newHistory, (item, index, arr) => {
                      return _.findIndex(arr, item) === index;
                    })
                    setHistoryLocal(newArr);
                  }}
                >
                    {locale === 'en' ? item.nameEn : item.name}
                  </a>
                  <Icon
                    title={stared ? '取消收藏' : '添加收藏'}
                    type="star"
                    className={`${cPrefixCls}-menus-content-menu-star`}
                    theme={stared ? 'filled' : 'outlined'}
                    onClick={() => {
                      let newStars;
                      if (stared) {
                        newStars = _.remove(stars, (star: any) => {
                          return star.path !== item.path;
                        });
                      } else {
                        newStars = _.concat(stars, item);
                      }
                      setLocal(newStars);
                    }}
                  />
                </dd>
              );
            })}
          </dl>
        );
      }
    ) : (
      <div style={{ color: '#333', fontSize: 14, marginTop: 20 }}>
        未找到与"<span style={{ color: '#FB4E57' }}>{queryParams}</span>
        "相关的产品
      </div>
    );
  };

  return (
    <Layout className={`${cPrefixCls}-menus`}>
      <Sider width={190} style={{ background: '#fff' }}>
        <div
          className={`${cPrefixCls}-menus-allBtn`}
          onMouseEnter={() => {
            setMenusContentVisible(true);
          }}
        >
          <Icon type="menu" className={`${cPrefixCls}-menus-allBtn-left`} />
          <span
            onClick={() => {
              setMenusVisible(false);
            }}
          >
            所有产品
          </span>
          <Icon
            type={menusContentVsible ? 'left' : 'right'}
            className={`${cPrefixCls}-menus-allBtn-right`}
            onClick={() => {
              setMenusVisible(false);
            }}
          />
        </div>
        {stars.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无收藏" />
        ) : (
          <StarMenus
            items={stars}
            setItems={setStars}
            complicated={complicated}
          />
        )}
      </Sider>
      <Content
        className={`${cPrefixCls}-menus-content`}
        style={{ display: menusContentVsible ? 'block' : 'none' }}
      >
        <div className={`${cPrefixCls}-menus-content-search`}>
          <Icon
            type="search"
            className={
              icon
                ? `${cPrefixCls}-menus-content-search-icons`
                : `${cPrefixCls}-menus-content-search-icon`
            }
          />
          <Input
            className={`${cPrefixCls}-menus-content-search-input`}
            placeholder="请输入关键词"
            onChange={(e) => {
              setQueryParams(e.target.value);
              e.target.value === '' ? setIcon(false) : setIcon(true);
            }}
          />
        </div>
        <div className={`${cPrefixCls}-menus-content-menus`}>
          {renderContentMenus(showMenus)}
        </div>
        <Icon
          type="close"
          className={`${cPrefixCls}-menus-close`}
          onClick={() => {
            setMenusVisible(false);
          }}
        />
      </Content>
    </Layout>
  );
}
