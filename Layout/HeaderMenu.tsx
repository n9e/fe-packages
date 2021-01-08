import React, { useState, useEffect, useMemo } from 'react';
import { Layout, Icon, Input } from 'antd';
import _ from 'lodash';
import classnames from 'classnames';
import { getIntl } from '../hooks/useFormatMessage';
import { prefixCls } from './config';
import StarMenus from './StarMenus';
import { isAbsolutePath } from './utils';

const cPrefixCls = `${prefixCls}-layout`;
const { Sider, Content } = Layout;


export default function HeaderMenu(props: any) {
  const { locale } = getIntl();
  const [menus, setMenus] = useState([] as any);
  const [icon, setIcon] = useState(false);
  const { menusContentVsible, setMenusContentVisible, setMenusVisible } = props;
  const [queryParams, setQueryParams] = useState('');
  const [historyList, setHistoryList] = useState([]);
  const [accessToken] = useState(localStorage.getItem('accessToken') as string);

  const showMenus = useMemo(() => menus.map((item: any) =>
    ({
      ...item, children: item?.children.filter((item: any) =>
        item.name.includes(queryParams) || !queryParams
      )
    })).filter((item: any) => item.children.length > 0)
    , [queryParams, menus]
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

  const [stars, setStars] = useState([
    {
      name: '用户资源中心',
      nameEn: 'RDB',
      path: 'rdb',
      icon: '#iconyonghuziyuanzhongxinicon1',
    },
    {
      name: '资产管理系统',
      nameEn: 'AMS',
      path: 'ams',
      icon: '#iconzichanguanlixitongicon1',
    },
    {
      name: '任务执行中心',
      nameEn: 'JOB',
      path: 'job',
      icon: '#iconrenwuzhongxinicon1',
    },
    {
      name: '监控告警系统',
      nameEn: 'MON',
      path: 'mon',
      icon: '#iconjiankonggaojingxitongicon1',
    },
  ]);

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
    fetch('/static/menusConfig.json')
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        setMenus(res);
      });
  }, []);

  const hasChildren = (menus: any): boolean => {
    let lock = false;
    menus.map((item: any) => {
      item?.children.length !== 0 && (lock = true)
    })
    return lock;
  }

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
            return (
              <dd
                key={item.name}
                className={classnames({
                  [`${cPrefixCls}-menus-content-menu`]: true,
                  [`${cPrefixCls}-menus-content-starMenu`]: stared,
                })}
              >
                <a
                  href={isAbsolutePath(item.path) ?
                     item.path.includes('?') ? `${item.path}&token=${accessToken}` : `${item.path}?token=${accessToken}` 
                      : `/${item.path}`}
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
                      newStars = _.remove(stars, (star) => {
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
    }) : <div style={{ color: '#333', fontSize: 14, marginTop: 20 }}>未找到与"<span style={{ color: '#FB4E57' }}>{queryParams}</span>"相关的产品</div>;
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
        <StarMenus items={stars} setItems={setStars} />
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
              e.target.value === '' ? setIcon(false) : setIcon(true)
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
