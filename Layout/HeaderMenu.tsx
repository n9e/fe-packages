import React, { useState, useEffect } from 'react';
import { Layout, Icon, Input } from 'antd';
import _ from 'lodash';
import classnames from 'classnames';
import { getIntl } from '../hooks/useFormatMessage';
import { prefixCls } from './config';
import StarMenus from './StarMenus';
import { isAbsolutePath } from './utils';

const cPrefixCls = `${prefixCls}-layout`;
const { Sider, Content } = Layout;


export default function HeaderMen(props: any) {
  const { locale } = getIntl();
  const [menus, setMenus] = useState([] as any);
  const [menusStart, setMenusStart] = useState([] as any);
  const [icon, setIcon] = useState(false);
  const { menusContentVsible, setMenusContentVisible, setMenusVisible } = props;

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
      icon: '#iconyonghuziyuanzhongxinicon',
    },
    {
      name: '资产管理系统',
      nameEn: 'AMS',
      path: 'ams',
      icon: '#iconzichanguanlixitongicon',
    },
    {
      name: '任务执行中心',
      nameEn: 'JOB',
      path: 'job',
      icon: '#iconrenwuzhongxinicon',
    },
    {
      name: '监控告警系统',
      nameEn: 'MON',
      path: 'mon',
      icon: '#iconjiankonggaojingxitongicon',
    },
  ]);
  const [historyList, setHistoryList] = useState([]);

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
      console.log(e);
    }
    try {
      defaultHistory = JSON.parse(menusHistory || '');
    } catch (e) {
      console.log(e);
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

  useEffect(() => {
    fetch('/static/menusConfig.json')
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        setMenusStart(res);
      });
  }, [icon]);

  const renderContentMenus = (menus: any[]) => {
    return _.map(menus, (menu) => {
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
          {_.map(menu.children, (item: any) => {
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
                  href={isAbsolutePath(item.path) ? item.path : `/${item.path}`}
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
    });
  };


  const onPressEnter = (e: any) => {
    console.log(e.target.value)
    const one = menus.map((first: any) => {
      const two = first?.children.filter((second: any) => {
        return second.name.indexOf(e.target.value) !== -1
      })
        // console.log(two)
        const arr = _.set(first, `children`, two)
        return arr;
    })
    // console.log(one)
    setMenus(one);
  }
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
            onPressEnter={onPressEnter}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '') {
                _.map(menus, (items, index) => {
                  _.set(items, `children`, menusStart[index]?.children);
                })
                setIcon(false);
              } else {
                setIcon(true);
              }
            }}
          />
        </div>
        <div className={`${cPrefixCls}-menus-content-menus`}>
          {renderContentMenus(menus)}
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
