import React, { useState, useEffect, useReducer } from 'react';
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
  const [menus, setMenus] = useState([]);
  const [icon, setIcon] = useState(false);
  const [value, setValue] = useState('');
  const { menusContentVsible, setMenusContentVisible, setMenusVisible } = props;
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  // const [historyList, setHistoryList] = useState([]);

  const setLocal = (name: any) => {
    setStars(name);
    const jsonArrayString = JSON.stringify(name);
    localStorage.setItem('stars', jsonArrayString);
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
  // const historyData = [{
  //   name: '最近访问',
  //   nameEn: 'History',
  //   type: 'group',
  //   children: historyList,
  // }];

  // const changeShow = (list: any) => {
  //   for (let i = 0; i < list.length; i++) {
  //     list[i].show = [];
  //     list[i].show[0] = locale === 'en' ? list[i].nameEn : list[i].name;
  //   }
  //   return list;
  // }

  const changeMenuShow = (list: any) => {
    for (let i = 0; i < list.length; i++) {
      for (let j = 0; j < list[i].children.length; j++) {
        list[i].children[j].show = [];
        list[i].children[j].show[0] =
          locale === 'en'
            ? list[i].children[j].nameEn
            : list[i].children[j].name;
      }
    }
    return list;
  };

    useEffect(() => {
      // setHistoryList(changeShow(historyList));
      changeMenuShow(menus);
      forceUpdate();
    }, [locale]);

  useEffect(() => {
    const cacheStars = localStorage.getItem('stars');
    let defaultStars = [];
    try {
      defaultStars = JSON.parse(cacheStars || '');
    } catch (e) {
      console.log(e);
    }

    if (defaultStars.length) {
      setStars(defaultStars);
    }
    // setHistoryList(changeShow(historyList));
    fetch('/static/menusConfig.json')
      .then((res) => {
        return res.json();
      })
      .then(async (res) => {
        const data = changeMenuShow(res);
        await setMenus(data);
      });
  }, []);

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
                <a href={isAbsolutePath(item.path) ? item.path : `/${item.path}`}>
                  {_.get(item, 'show.length') === 2 ? (
                    <span>
                      {_.get(item, 'show[0]')}
                      <span className="valueColor">{value}</span>
                      {_.get(item, 'show[1]')}
                    </span>
                  ) : (
                    _.get(item, 'show[0]')
                  )}
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
              setValue(e.target.value);
              if (e.target.value === '') {
                setIcon(false);
                // changeShow(historyList);
                changeMenuShow(menus);
              } else {
                setIcon(true);
                // for (let i = 0; i < historyList.length; i++) {
                //   if (locale === 'en') {
                // let en = historyList[i].nameEn.split(e.target.value);
                // historyList[i].show = en;
                //   const en = _.get(historyList, `[${i}].nameEn`).split(e.target.value);
                //   _.set(historyList, `[${i}].show`, en);
                // } else {
                // let zh = historyList[i].name.split(e.target.value);
                // historyList[i].show = zh;
                //     const zh = _.get(historyList, `[${i}].name`).split(e.target.value);
                //     _.set(historyList, `[${i}].show`, zh);
                //   }
                // }
                for (let i = 0; i < menus.length; i++) {
                  for (let j = 0; j < _.get(menus[i], 'children.length'); j++) {
                    if (locale === 'en') {
                      const en = _.get(
                        menus,
                        `[${i}].children.[${j}].nameEn`,
                        ''
                      ).split(e.target.value);
                      _.set(menus, `[${i}].children[${j}].show`, en);
                    } else {
                      const zh = _.get(
                        menus,
                        `[${i}].children.[${j}].name`,
                        ''
                      ).split(e.target.value);
                      _.set(menus, `[${i}].children[${j}].show`, zh);
                    }
                  }
                }
              }
            }}
          />
        </div>
        {/* <div className={`${cPrefixCls}-menus-content-menus-history`}>
          {renderContentMenus(historyData)}
        </div> */}
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
