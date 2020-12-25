import React, { Component } from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Layout } from 'antd';
import classNames from 'classnames';
import _ from 'lodash';
import { prefixCls } from './config';
import { auth } from '../Auth';
import LayoutMenu from './LayoutMenu';
import Provider, { NsTreeContext } from './Provider';
import NsTree from './NsTree';
import Splitter from './Splitter';
import './assets/iconfont/iconfont.css';
import './assets/iconfont/iconfont.js';

const nstreeArrowImg = require('./assets/nstree-arrow.png');

interface Props {
  noBackground?: boolean,
  menus: any,
  treeVisible: boolean,
  systemName: string,
  systemNameChn: string,
  children: React.ReactNode,
  isMenuNecessary?: boolean; // 是否需要菜单
}

interface State {
  checkAuthenticateLoading: boolean,
  siderMenuVisible: boolean,
  collapsed: boolean,
  isMenuNecessary: boolean; // 是否需要菜单
  permissionPoints: object;
}

const defaultCollapsed = window.localStorage.getItem('siderMenuCollapsed') === 'true' ? true : false;
const { Content, Sider } = Layout;

class NILayout extends Component<Props & RouteComponentProps, State> {
  state = {
    checkAuthenticateLoading: true,
    siderMenuVisible: false,
    collapsed: defaultCollapsed,
    isMenuNecessary: this.props.isMenuNecessary === undefined ? true : this.props.isMenuNecessary,
    permissionPoints: {},
    diff: 0,
  };

  sidebarWidth = 230

  constructor(props: Props & RouteComponentProps) {
    super(props);
    // ccp 项目列表左侧菜单为空，所以默认做收起处理
    const { location: { pathname } } = this.props;
    if (pathname === '/resource/project') {
      this.state = {
        ...this.state,
        siderMenuVisible: true,
      };
    }
  }

  componentDidMount = () => {
    this.checkAuthenticate();
    window.addEventListener('message', (event) => {
      const { data } = event;
      if (_.isPlainObject(data) && data.type === 'permissionPoint') {
        this.setState({ permissionPoints: data.value });
      }
    }, false);
  }

  checkAuthenticate() {
    auth.checkAuthenticate().then(() => {
      this.setState({ checkAuthenticateLoading: false });
    });
  }

  renderContent() {
    const { noBackground = false } = this.props;
    const cPrefixCls = `${prefixCls}-layout`;

    return (
      <NsTreeContext.Consumer>
        {
          (context) => (
            <Layout
              className={classNames({
                [`${cPrefixCls}-container`]: true,
                [`${cPrefixCls}-has-sider`]: context.nsTreeVisible,
              })}
              style={{ height: '100%' }}
            >
              <Sider
                className={`${cPrefixCls}-sider-nstree`}
                width={this.sidebarWidth}
                style={{
                  display: context.nsTreeVisible ? 'block' : 'none',
                }}
              >
                <NsTree
                  prefixCls={cPrefixCls}
                  loading={context.data.treeLoading}
                  treeData={context.data.treeData}
                  treeNodes={context.data.treeNodes}
                  expandedKeys={context.data.expandedKeys}
                  onSearchValue={(val: string) => {
                    context.setTreeSearchValue(val);
                  }}
                  onExpandedKeys={(val: string[]) => {
                    context.setExpandedKeys(val);
                  }}
                />
                  <Splitter
                      onResize={diff => {
                        this.setState(
                          {
                            diff,
                          },
                          () => {
                            this.sidebarWidth = this.sidebarWidth - this.state.diff;
                            this.sidebarWidth = this.sidebarWidth < 230 ? 230 : this.sidebarWidth;
                          },
                        );
                      }}
                    />
              </Sider>
              <Content className={`${cPrefixCls}-content`} style={{ position: 'relative' }}>
                <div className={classNames({
                  [`${cPrefixCls}-main`]: true,
                  [`${cPrefixCls}-main-noBg`]: noBackground,
                })} id={`${cPrefixCls}-main`}>
                  {this.props.children}
                </div>
                <div
                  className={classNames({
                    [`${cPrefixCls}-sider-nstree-arrow`]: true,
                    [`${cPrefixCls}-sider-nstree-arrow-left`]: context.nsTreeVisible,
                    [`${cPrefixCls}-sider-nstree-arrow-right`]: !context.nsTreeVisible,
                  })}
                  onClick={() => {
                    context.nsTreeVisibleChange(!context.nsTreeVisible, true, true);
                  }}
                  style={{
                    display: context.nsTreeArrowVisible ? 'block' : 'none'
                  }}
                >
                  <img src={nstreeArrowImg} />
                </div>
              </Content>
            </Layout>
          )
        }
      </NsTreeContext.Consumer>
    );
  }

  render() {
    const { systemName, menus } = this.props;
    const { checkAuthenticateLoading, collapsed, siderMenuVisible, isMenuNecessary } = this.state;
    const currentSystemMenuConf = _.get(menus, 'children');

    const cPrefixCls = `${prefixCls}-layout`;
    const { isroot } = auth.getSelftProfile();

    if (checkAuthenticateLoading) {
      return <div>loading...</div>;
    }

    return (
      <Provider treeVisible={this.props.treeVisible}>
        <Layout className={cPrefixCls}>
          <Layout>
            {isMenuNecessary && !siderMenuVisible &&
              <Sider
                theme="light"
                width={190}
                collapsedWidth={56}
                className={
                  classNames({
                    [`${cPrefixCls}-sider-nav`]: true,
                  })
                }
                trigger={null}
                collapsible
                collapsed={collapsed}
              >
                <div
                  className={`${prefixCls}-layout-sider-nav-systemName`}
                  style={{
                    paddingLeft: collapsed ? 20 : 24,
                  }}
                >
                  {
                    collapsed ?
                      <svg className={`${prefixCls}-layout-menus-icon`} aria-hidden="true" style={{ marginRight: 0 }}>
                        <use xlinkHref={_.get(menus, 'icon')}></use>
                      </svg> :
                      <span>
                        <svg className={`${prefixCls}-layout-menus-icon`} aria-hidden="true">
                          <use xlinkHref={_.get(menus, 'icon')}></use>
                        </svg>
                        {this.props.systemNameChn}
                      </span>
                  }
                </div>
                <LayoutMenu
                  systemName={systemName}
                  systemNameChn={this.props.systemNameChn}
                  isroot={isroot}
                  menuConf={currentSystemMenuConf}
                  className={`${cPrefixCls}-menu`}
                  collapsed={collapsed}
                  permissionPoints={this.state.permissionPoints}
                />
                <div
                  className={`${prefixCls}-layout-sider-nav-bottom`}
                  onClick={() => {
                    this.setState({
                      collapsed: !collapsed,
                    });
                    window.localStorage.setItem('siderMenuCollapsed', String(!collapsed));
                  }}
                >
                  <svg className={`${prefixCls}-layout-menus-icon`} aria-hidden="true">
                    <use xlinkHref={collapsed ? '#iconzhankaiicon' : '#iconshouqiicon'}></use>
                  </svg>
                </div>
              </Sider>
            }
            <Content
              style={{
                marginLeft: isMenuNecessary ? (collapsed ? 56 : 190) : 0,
                overflow: 'hidden',
              }}
            >
              {this.renderContent()}
            </Content>
          </Layout>
        </Layout>
      </Provider>
    );
  }
}

export default withRouter(NILayout);
