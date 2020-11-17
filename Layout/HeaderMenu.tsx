import React, { useState, useEffect} from 'react';
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
  const [value, setValue] = useState('');
  const [search, setSearch] = useState(true);
  const { menusContentVsible, setMenusContentVisible, setMenusVisible } = props;
<<<<<<< HEAD
=======
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
<<<<<<< HEAD
=======
  const [historyList, setHistoryList] = useState([] as any);
>>>>>>> 999c1bf44e04769bea09309dc8fccacc85e11438
>>>>>>> d2cc2734bc1b1f2dcef38c5acc55ee160db4ee81

  const setLocal = (name: any) => {
    setStars(name);
    const jsonArrayString = JSON.stringify(name);
    localStorage.setItem('stars', jsonArrayString);
    console.log();
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
<<<<<<< HEAD
  const [historyList, setHistoryList] = useState([]);
<<<<<<< HEAD
=======
  const historyData = [
    {
      name: '最近访问',
      nameEn: 'History',
      type: 'group',
      children: historyList,
    },
  ];
=======
  const historyData = [{
    name: '最近访问',
    nameEn: 'History',
    type: 'group',
    children: historyList,
  }];
>>>>>>> 999c1bf44e04769bea09309dc8fccacc85e11438

  const changeShow = (list: any) => {
    for (let i = 0; i < list.length; i++) {
      list[i].show = [];
      list[i].show[0] = locale === 'en' ? list[i].nameEn : list[i].name;
    }
    return list;
<<<<<<< HEAD
  };
=======
  }
>>>>>>> 999c1bf44e04769bea09309dc8fccacc85e11438

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
>>>>>>> d2cc2734bc1b1f2dcef38c5acc55ee160db4ee81

<<<<<<< HEAD
  useEffect(() => {
    setHistoryList(historyList);
  }, [locale]);
=======
    useEffect(() => {
      setHistoryList(changeShow(historyList));
      changeMenuShow(menus);
      forceUpdate();
    }, [locale]);
>>>>>>> 999c1bf44e04769bea09309dc8fccacc85e11438

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
<<<<<<< HEAD
    setHistoryList(historyList);
=======
    setHistoryList(changeShow(historyList));
<<<<<<< HEAD
>>>>>>> d2cc2734bc1b1f2dcef38c5acc55ee160db4ee81

    if (defaultHistory.length) {
      setHistoryList(defaultHistory);
    }
=======
>>>>>>> 999c1bf44e04769bea09309dc8fccacc85e11438
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
        setMenus(res);
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
                  href={isAbsolutePath(item.path) ? item.path : `/${item.path}`}
                  onClick={() => {
                    let newHistory = _.concat(historyList, item);
                    let reverse = _.reverse(newHistory)
                    let newArr = _.filter(reverse, (item, index, arr) => {
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
              if (e.target.value === '') {
                setIcon(false);
              } else {
                setIcon(true);
<<<<<<< HEAD
                _.filter(menus, (item) => {
                  _.filter(item?.children, (items) => {
                    let menuss = [] as any;
                    if (items?.name.indexOf(e.target.value) !== -1) {
                      setSearch(true);
                      const arr = _.concat(menuss, items);
                      _.set(item, `children`, arr);
                    } else if (items?.name.indexOf(e.target.value) === -1) {
                      setValue(e.target.value);
                      setSearch(false);
=======
                for (let i = 0; i < historyList.length; i++) {
                  if (locale === 'en') {
<<<<<<< HEAD
                    const en = _.get(historyList, `[${i}].nameEn`).split(
                      e.target.value
                    );
                    _.set(historyList, `[${i}].show`, en);
                  } else {
                    const zh = _.get(historyList, `[${i}].name`).split(
                      e.target.value
                    );
=======
                  const en = _.get(historyList, `[${i}].nameEn`).split(e.target.value);
                  _.set(historyList, `[${i}].show`, en);
                } else {
                    const zh = _.get(historyList, `[${i}].name`).split(e.target.value);
>>>>>>> 999c1bf44e04769bea09309dc8fccacc85e11438
                    _.set(historyList, `[${i}].show`, zh);
                  }
                }
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
>>>>>>> d2cc2734bc1b1f2dcef38c5acc55ee160db4ee81
                    }
                  })
                })
              }
            }}
          />
        </div>
        {!icon ? <div>
          <div className={`${cPrefixCls}-menus-content-menus`}>
            {renderContentMenus(menusStart)}
          </div>
        </div> : search ? <div>
          <div className={`${cPrefixCls}-menus-content-menus`}>
            {renderContentMenus(menus)}
          </div>
        </div> : <div style={{color:'#333', fontSize:14, marginTop:20 }}>未找到与"<span style={{color:'#FB4E57'}}>{value}</span>"相关的产品</div>}

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
