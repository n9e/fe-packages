import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import classnames from 'classnames';
import { FormattedMessage } from 'react-intl';
import {
  Layout,
  Dropdown,
  Menu,
  Icon,
  Drawer,
  Divider,
  Badge,
  TreeSelect,
  Popover,
} from 'antd';
import { normalizeTreeData } from './utils';
import { auth } from '../Auth';
import { prefixCls } from './config';
import HeaderMenu from './HeaderMenu';
import Settings from './Settings';
import './style.less';
import './assets/iconfont/iconfont.css';
import './assets/iconfont/iconfont.js';
import request from '@pkgs/request';
import api from '@pkgs/api';

interface Props {
  tenantProjectVisible: boolean;
  children: React.ReactNode;
  language: string;
  onLanguageChange: (language: string) => void;
  selectedTenantProject: any;
  setSelectedTenantProject: (newSelectedTenantProject: any) => void;
  belongProjects: any;
  onMount: () => void;
}

const userIconSrc = require('./assets/avatars.png');
const { Header } = Layout;
const normalizeTenantProjectData = (
  data: any[],
  tenantIdent?: string,
  tenantId?: number,
  tenantName?: string,
): any => {
  return _.map(data, (item) => {
    if (item.children) {
      return {
        ...item,
        tenantIdent: tenantIdent || item.ident,
        tenantId: tenantId || item.id,
        tenantName: tenantName || item.name,
        children: normalizeTenantProjectData(
          item.children,
          tenantIdent || item.ident,
          tenantId || item.id,
          tenantName || item.name,
        ),
      };
    }
    return {
      ...item,
      tenantIdent,
      tenantId,
      tenantName,
    };
  });
};
const treeIcon: (node: any) => JSX.Element = (node) => (
  <span
    style={{
      display: 'inline-block',
      backgroundColor: node.icon_color,
      width: 16,
      height: 16,
      lineHeight: '16px',
      borderRadius: 16,
      color: '#fff',
    }}
  >
    {node.icon_char}
  </span>
);
const renderTreeNodes = (nodes: any[]) => {
  return _.map(nodes, (node) => {
    if (_.isArray(node.children)) {
      return (
        <TreeSelect.TreeNode
          icon={treeIcon(node)}
          title={node.name}
          fullTitle={`${node.tenantName}-${node.name}`}
          key={String(node.id)}
          value={node.id}
          path={node.path}
          node={node}
          selectable={false}
        >
          {renderTreeNodes(node.children)}
        </TreeSelect.TreeNode>
      );
    }
    return (
      <TreeSelect.TreeNode
        icon={treeIcon(node)}
        title={node.name}
        fullTitle={`${node.tenantName}-${node.name}`}
        key={String(node.id)}
        value={node.id}
        path={node.path}
        isLeaf={true}
        node={node}
      />
    );
  });
};

export default function index(props: Props) {
  const cPrefixCls = `${prefixCls}-layout`;
  const [dispname, setDispname] = useState('');
  const [menusVisible, setMenusVisible] = useState(false);
  const [menusContentVsible, setMenusContentVisible] = useState(false);
  const [feConf, setFeConf] = useState({} as any);
  const treeData = normalizeTreeData(props.belongProjects);
  const content = <p style={{ height: 0 }}>工单</p>;
  const message = <p style={{ height: 0 }}>消息</p>;
  const text = <p style={{ height: 0 }}>文档中心</p>;

  const [messageCount, setMessageCount] = useState();
  const [ticketMessageCount, setTicketMessageCount] = useState();

  useEffect(() => {
    auth.checkAuthenticate().then(() => {
      setDispname(_.get(auth.getSelftProfile(), 'dispname'));
      props.onMount();
    });
    fetch('/static/feConfig.json')
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        setFeConf(res);
      });
  }, []);


  useEffect(() => {
    // 获取消息的未读数量
    if (feConf.header && feConf.header.mode === 'complicated') {
      request(`${api.messageCount}?status=0`).then((count = 0) => {
        setMessageCount(count);
      });
      request(`${api.ticketMessageCount}?limit=1000&p=1&onlyApprovePending=true`).then(res => {
        res.total && setTicketMessageCount(res.total)
      });
    }
  }, [feConf]);

  const disabledSystems = ['mis', 'crds', 'rdb', 'ams', 'job', 'mon'];
  const disabledSystemsBlacklist = ['/crds/rootstatistics', '/crds/api/myapi'];
  const { pathname } = window.location;
  const checked = _.some(disabledSystems, (item) => {
    if (pathname.indexOf(`/${item}/`) === 0 || pathname === `/${item}`) {
      return !_.some(disabledSystemsBlacklist, (blacklistItem) => {
        return pathname.indexOf(blacklistItem) === 0;
      });
    }
    return false;
  });

  return (
    <Layout className={cPrefixCls}>
      <Header className={`${cPrefixCls}-header`}>
        <div className={`${cPrefixCls}-header-left`}>
          <div
            className={classnames({
              [`${cPrefixCls}-header-menu`]: true,
              [`${cPrefixCls}-header-menu-active`]: menusVisible,
            })}
            onClick={() => {
              setMenusVisible(!menusVisible);
              setMenusContentVisible(false);
            }}
          >
            <Icon type={!menusVisible ? 'menu' : 'close'} />
          </div>
          <a href='/' className={`${cPrefixCls}-logo`}>
            <img
              src={_.get(feConf, 'header.logo')}
              alt="logo"
              style={{
                height: 24,
              }}
            />
            {_.get(feConf, 'header.subTitle')}
          </a>
        </div>
        <div className={`${cPrefixCls}-header-right`}>
          {_.get(feConf, 'header.mode') === 'complicated' ? (
            <>
              {props.tenantProjectVisible && !checked ? (
                <TreeSelect
                  size="small"
                  showSearch
                  treeIcon
                  className="global-tenantProject-select"
                  style={{ width: '200px', position: 'relative', top: -2 }}
                  dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                  placeholder="请选择租户和项目"
                  treeNodeLabelProp="fullTitle"
                  treeDefaultExpandAll
                  treeNodeFilterProp="fullTitle"
                  filterTreeNode={(inputValue: string, treeNode: any) => {
                    const { fullTitle = '', path = '' } = treeNode.props;
                    return fullTitle.indexOf(inputValue) > -1 || path.indexOf(inputValue) > -1;
                  }}
                  value={_.get(props.selectedTenantProject, 'project.id')}
                  onChange={(_value, _label, extra) => {
                    const newSelectedTenantProject = {
                      tenant: {
                        id: _.get(extra, 'triggerNode.props.node.tenantId'),
                        ident: _.get(extra, 'triggerNode.props.node.tenantIdent'),
                      },
                      project: {
                        id: _.get(extra, 'triggerNode.props.node.id'),
                        ident: _.get(extra, 'triggerNode.props.node.ident'),
                        path: _.get(extra, 'triggerNode.props.node.path'),
                      },
                    };
                    props.setSelectedTenantProject(newSelectedTenantProject);
                  }}
                >
                  {renderTreeNodes(normalizeTenantProjectData(treeData))}
                </TreeSelect>
              ) : null}
              <div className={`${cPrefixCls}-header-right-links`}>
                <a href="/rdb">用户中心</a>
                <a href="/mis">运营中心</a>
                <a href="/crds">资源中心</a>
                <a href="/console">
                  <Popover content="控制台">
                    <svg className={`${cPrefixCls}-header-menus-icon`} aria-hidden="true">
                      <use xlinkHref='#iconkongzhitaiicon'></use>
                    </svg>
                  </Popover>
                </a>
              </div>
              <Divider
                className={`${cPrefixCls}-header-right-divider`}
                type="vertical"
              />
              <div className={`${cPrefixCls}-header-right-icons`}>
                <a className="text ticket-icon" href="/rdb/ticket/my-ticket">
                  <Popover content={content}>
                    <span className="iconfont icongongdanicon" />
                  </Popover>
                  <Badge count={ticketMessageCount} className="badge"></Badge>
                </a>
                <a className="text" href="/portal/message">
                  <Popover content={message}>
                    <span className="iconfont iconxiaoxiicon" />
                  </Popover>
                  <Badge count={messageCount} className="badge"></Badge>
                </a>
                <a href="/portal/document">
                  <Popover content={text}>
                    <span className="iconfont iconwendangicon" />
                  </Popover>
                </a>
                {/* <a
                    onClick={() => {
                      const newLanguage = props.language == 'en' ? 'zh' : 'en';
                      props.onLanguageChange(newLanguage);
                    }}
                  >
                    <svg style={{ width: 20, height: 14 }} aria-hidden="true">
                      <use xlinkHref={getSymbolByLanguage(props.language)}></use>
                    </svg>
                  </a> */}
              </div>
              <Divider
                className={`${cPrefixCls}-header-right-divider`}
                type="vertical"
              />
            </>
          ) : null}
          <Dropdown
            placement="bottomRight"
            overlay={
              <Menu style={{ width: 125 }}>
                <Menu.Item>
                  <a
                    onClick={() => {
                      Settings({
                        language: props.language,
                      });
                    }}
                  >
                    <Icon type="setting" className="mr10" />
                    <FormattedMessage id="user.settings" />
                  </a>
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item>
                  <a
                    onClick={() => {
                      auth.signout(() => {
                        window.location.href = '/';
                      });
                    }}
                  >
                    <Icon type="logout" className="mr10" />
                    <FormattedMessage id="logout" />
                  </a>
                </Menu.Item>
              </Menu>
            }
          >
            <span className={`${cPrefixCls}-username`}>
              <img src={userIconSrc} alt="" />
              <span style={{ paddingRight: 5 }}>{dispname}</span>
              <Icon type="down" />
            </span>
          </Dropdown>
        </div>
      </Header>
      <div
        style={{
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div className={`${cPrefixCls}-main`}>{props.children}</div>
        <Drawer
          placement="left"
          width={menusContentVsible ? 1230 : 190}
          closable={false}
          visible={menusVisible}
          getContainer={false}
          style={{ position: 'absolute' }}
          drawerStyle={{
            overflow: 'hidden',
          }}
          bodyStyle={{
            padding: 0,
          }}
          onClose={() => {
            setMenusVisible(false);
          }}
        >
          <HeaderMenu
            menusContentVsible={menusContentVsible}
            setMenusContentVisible={setMenusContentVisible}
            setMenusVisible={setMenusVisible}
          />
        </Drawer>
      </div>
    </Layout>
  );
}
