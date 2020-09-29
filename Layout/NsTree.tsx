import React, { Component } from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import {
  Tree, Spin, Input, Modal, Form, Checkbox, Select, message,
} from 'antd';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, WrappedComponentProps } from 'react-intl';
import _ from 'lodash';
import { FormProps } from 'antd/lib/form';
import ContextMenu from '../ContextMenu';
import ModalControl, { ModalWrapProps } from '../ModalControl';
import { renderTreeNodes } from './utils';
import { NsTreeContext, NsTreeContextData } from './Provider';
import { TreeNode } from '../interface';
import clipboard from '../clipboard';
import request from '../request';
import api from '../api';
import UserSelect from '../UserSelect';

interface Node {
  ident: string,
  name: string,
  leaf: 0 | 1,
  cate: string,
  note?: string,
  admin_ids: number[],
}

interface NodeEditorModalProps {
  type: 'create' | 'modify',
  pid?: number,
  initialValues?: Node,
  onOk: (values: any, destroy?: () => void) => void,
}

type Handle = (context: NsTreeContextData, p2?: any) => void;

const FormItem = Form.Item;

class NodeEditorModal extends Component<NodeEditorModalProps & ModalWrapProps & FormProps> {
  titleMap = {
    create: <FormattedMessage id="node.create" />,
    modify: <FormattedMessage id="node.modify" />,
  };

  state = {
    nodeCateData: [] as TreeNode[],
    selectedAdminIds: [] as number[],
  };

  componentDidMount() {
    this.fetchNodeCateData();
    this.fetchNodeData();
  }

  fetchNodeCateData() {
    request(`${api.nodeCates}`).then((res: any) => {
      const nodeCateData = _.filter(res, (item) => item.cate !== 'tenant');
      this.setState({ nodeCateData });
    });
  }

  fetchNodeData() {
    if (this.props.type === 'modify') {
      request(`${api.node}/${_.get(this.props, 'initialValues.id')}`).then((res) => {
        this.setState({
          selectedAdminIds: _.map(res.admins, 'id'),
        });
      });
    }
  }

  handleOk = () => {
    this.props.form!.validateFields((err, values) => {
      if (!err) {
        this.props.onOk({
          ...values,
          leaf: values.leaf ? 1 : 0,
        }, this.props.destroy);
      }
    });
  }

  handleCancel = () => {
    this.props.destroy();
  }

  render() {
    const {
      type, pid, initialValues, visible,
    } = this.props;
    const { selectedAdminIds } = this.state;
    const { getFieldDecorator } = this.props.form!;
    const isLeafVisible = type === 'create' && pid !== 0;
    let defaultCate = initialValues ? initialValues.cate : ''

    if (pid === 0) {
      defaultCate = 'tenant';
    }

    return (
      <Modal
        title={this.titleMap[type]}
        visible={visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        <Form
          layout="vertical"
          onSubmit={(e) => {
            e.preventDefault();
            this.handleOk();
          }}
        >
          <FormItem label={<FormattedMessage id="node.ident" />}>
            {getFieldDecorator('ident', {
              initialValue: initialValues ? initialValues.ident : '',
              rules: [{ required: true }],
            })(
              <Input disabled={type === 'modify'} />,
            )}
          </FormItem>
          <FormItem label={<FormattedMessage id="node.name" />}>
            {getFieldDecorator('name', {
              initialValue: initialValues ? initialValues.name : '',
              rules: [{ required: true }],
            })(
              <Input />,
            )}
          </FormItem>
          {
            isLeafVisible
              ? (
                <FormItem>
                  {getFieldDecorator('leaf', {
                    initialValue: initialValues ? initialValues.leaf : 0,
                    rules: [{ required: true }],
                  })(
                    <Checkbox><FormattedMessage id="node.isLeaf" /></Checkbox>,
                  )}
                </FormItem>
              ) : null
          }
          <FormItem label={<FormattedMessage id="node.cate" />}>
            {getFieldDecorator('cate', {
              initialValue: defaultCate,
              rules: [{ required: true }],
            })(
              <Select
                disabled={pid === 0}
                allowClear
                showSearch
                optionFilterProp="children"
              >
                {
                _.map(this.state.nodeCateData, (item) => <Select.Option key={item.ident} value={item.ident}>{item.name}({item.ident})</Select.Option>)
              }
              </Select>,
            )}
          </FormItem>
          <FormItem label={<FormattedMessage id="node.admins" />}>
            {getFieldDecorator('admin_ids', {
              initialValue: selectedAdminIds,
            })(
              <UserSelect mode="multiple" />,
            )}
          </FormItem>
          <FormItem label={<FormattedMessage id="node.note" />}>
            {getFieldDecorator('note', {
              initialValue: initialValues ? initialValues.note : '',
            })(
              <Input />,
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

const nodeEditorModal = ModalControl(Form.create()(NodeEditorModal));

interface Props {
  prefixCls?: string,
  treeNodes: TreeNode[],
  treeData: TreeNode[],
  loading: boolean,
  expandedKeys: string[],
  onSearchValue: (searchValue: string) => void,
  onExpandedKeys: (expandedKeys: string[]) => void,
}

class NsTree extends Component<Props & WrappedComponentProps & RouteComponentProps> {
  static defaultProps = {
    treeNodes: [],
    treeData: [],
  };

  static contextTypes = {
    selecteNode: PropTypes.func,
    getSelectedNode: PropTypes.func,
  };

  state = {
    contextMenuVisiable: false,
    contextMenuTop: 0,
    contextMenuLeft: 0,
    contextMenuType: 'createPdl',
    contextMenuSelectedNode: {},
  }

  handleNodeSelect: Handle = (context, selectedKeys: string[]) => {
    const { treeData } = this.props;
    const currentNode = _.find(treeData, { id: _.toNumber(selectedKeys[0]) });
    if (currentNode) {
      context.selecteTreeNode(currentNode);
      if (_.get(context.getSelectedNode(), 'id') !== _.get(currentNode, 'id')) {
        this.props.history.replace({
          pathname: this.props.location.pathname,
          search: currentNode ? `nid=${_.get(currentNode, 'id')}` : '',
        });
      }
      window.postMessage({
        type: 'nid',
        value: _.get(currentNode, 'id'),
      }, window.origin);
    }
  }

  handleCreatePdlNode: Handle = (context) => {
    this.setState({ contextMenuVisiable: false });
    nodeEditorModal({
      language: this.props.intl.locale,
      type: 'create',
      pid: 0,
      onOk: (values: any, destroy: any) => {
        request(api.nodes, {
          method: 'POST',
          body: JSON.stringify({
            ...values,
            pid: 0,
            leaf: 0,
          }),
        }).then((res: any) => {
          message.success(this.props.intl.formatMessage({ id: 'msg.create.success' }));
          context.appendTreeNode(res);
          destroy();
        });
      },
    });
  }

  handleCreateNode: Handle = (context) => {
    this.setState({ contextMenuVisiable: false });
    const selectedNode = this.state.contextMenuSelectedNode as { node: TreeNode };
    const { id: pid } = selectedNode.node;
    let treeData = context.getTreeData();
    nodeEditorModal({
      language: this.props.intl.locale,
      type: 'create',
      pid,
      onOk: (values: any, destroy: any) => {
        request(api.nodes, {
          method: 'POST',
          body: JSON.stringify({
            ...values,
            pid,
          }),
        }).then((res: any) => {
          message.success(this.props.intl.formatMessage({ id: 'msg.create.success' }));
          treeData = context.appendTreeNode(res, treeData as any) as any;
          // destroy();
        });
      },
    });
  }

  handleModifyNode: Handle = (context) => {
    this.setState({ contextMenuVisiable: false });
    const selectedNode = this.state.contextMenuSelectedNode as { node: TreeNode };
    const { id, name, cate, note } = selectedNode.node;
    nodeEditorModal({
      language: this.props.intl.locale,
      type: 'modify',
      initialValues: selectedNode.node,
      onOk: (values: any, destroy: any) => {
        request(`${api.node}/${id}`, {
          method: 'PUT',
          body: JSON.stringify(values),
        }).then((res: any) => {
          message.success(this.props.intl.formatMessage({ id: 'msg.modify.success' }));
          context.updateTreeNode(id, res);
          destroy();
        });
      },
    });
  }

  handleDeleteNode: Handle = (context) => {
    this.setState({ contextMenuVisiable: false });
    Modal.confirm({
      title: this.props.intl.formatMessage({ id: 'table.delete.sure' }),
      content: '',
      onOk: () => {
        const selectedNode = this.state.contextMenuSelectedNode as { node: TreeNode };
        const { id } = selectedNode.node;
        request(`${api.node}/${id}`, {
          method: 'DELETE',
        }).then(() => {
          message.success(this.props.intl.formatMessage({ id: 'msg.delete.success' }));
          context.removeTreeNode(id);
          Modal.destroyAll();
        });
      },
    });
  }

  handleCopyPath: Handle = (context) => {
    this.setState({ contextMenuVisiable: false });
    const copySucceeded = clipboard(_.get(context, 'data.selectedNode.path'));

    if (copySucceeded) {
      message.success(this.props.intl.formatMessage({ id: 'node.copy.path.success' }));
    } else {
      message.success(this.props.intl.formatMessage({ id: 'node.copy.path.error' }));
    }
  }

  render() {
    const {
      treeNodes, loading, expandedKeys, prefixCls,
    } = this.props;

    return (
      <div className={`${prefixCls}-nsTree`}>
        <div className={`${prefixCls}-nsTree-header`}>
          <Input.Search
            onSearch={this.props.onSearchValue}
            placeholder={this.props.intl.formatMessage({ id: 'tree.search' })}
          />
        </div>
        <Spin spinning={loading}>
          <div
            className={`${prefixCls}-nsTree-content-container`}
            onContextMenu={(e) => {
              e.preventDefault();
              this.setState({
                contextMenuVisiable: true,
                contextMenuLeft: e.clientX,
                contextMenuTop: e.clientY,
                contextMenuType: 'createPdl',
              });
            }}
          >
            {
              _.isEmpty(treeNodes)
                ? (
                  <div className="ant-empty ant-empty-small" style={{ marginTop: 50 }}>
                    <div className="ant-empty-image">
                      <img
                        alt="No Data"
                        src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNDEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMCAxKSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KICAgIDxlbGxpcHNlIGZpbGw9IiNGNUY1RjUiIGN4PSIzMiIgY3k9IjMzIiByeD0iMzIiIHJ5PSI3Ii8+CiAgICA8ZyBmaWxsLXJ1bGU9Im5vbnplcm8iIHN0cm9rZT0iI0Q5RDlEOSI+CiAgICAgIDxwYXRoIGQ9Ik01NSAxMi43Nkw0NC44NTQgMS4yNThDNDQuMzY3LjQ3NCA0My42NTYgMCA0Mi45MDcgMEgyMS4wOTNjLS43NDkgMC0xLjQ2LjQ3NC0xLjk0NyAxLjI1N0w5IDEyLjc2MVYyMmg0NnYtOS4yNHoiLz4KICAgICAgPHBhdGggZD0iTTQxLjYxMyAxNS45MzFjMC0xLjYwNS45OTQtMi45MyAyLjIyNy0yLjkzMUg1NXYxOC4xMzdDNTUgMzMuMjYgNTMuNjggMzUgNTIuMDUgMzVoLTQwLjFDMTAuMzIgMzUgOSAzMy4yNTkgOSAzMS4xMzdWMTNoMTEuMTZjMS4yMzMgMCAyLjIyNyAxLjMyMyAyLjIyNyAyLjkyOHYuMDIyYzAgMS42MDUgMS4wMDUgMi45MDEgMi4yMzcgMi45MDFoMTQuNzUyYzEuMjMyIDAgMi4yMzctMS4zMDggMi4yMzctMi45MTN2LS4wMDd6IiBmaWxsPSIjRkFGQUZBIi8+CiAgICA8L2c+CiAgPC9nPgo8L3N2Zz4K"
                      />
                    </div>
                    <p className="ant-empty-description">No Data</p>
                  </div>
                )
                : (
                  <div className={`${prefixCls}-nsTree-content`}>
                    <NsTreeContext.Consumer>
                      {
                      (context) => {
                        return <Tree
                          showLine
                          showIcon
                          selectedKeys={context.data.selectedNode ? [_.toString(context.data.selectedNode.id)] : undefined}
                          expandedKeys={expandedKeys}
                          onSelect={(selectedKeys) => {
                            this.handleNodeSelect(context, selectedKeys);
                          }}
                          onExpand={(newExpandedKeys) => {
                            this.props.onExpandedKeys(newExpandedKeys);
                          }}
                          onRightClick={(e) => {
                            e.event.stopPropagation();
                            this.setState({
                              contextMenuVisiable: true,
                              contextMenuLeft: e.event.clientX,
                              contextMenuTop: e.event.clientY,
                              contextMenuType: 'operate',
                              contextMenuSelectedNode: e.node.props,
                            });
                          }}
                        >
                          {renderTreeNodes(treeNodes)}
                        </Tree>
                      }
                    }
                    </NsTreeContext.Consumer>
                  </div>
                )
            }
          </div>
          <NsTreeContext.Consumer>
            {
              (context) => (
                <ContextMenu visible={this.state.contextMenuVisiable} left={this.state.contextMenuLeft} top={this.state.contextMenuTop}>
                  <ul
                    className="ant-dropdown-menu ant-dropdown-menu-vertical ant-dropdown-menu-light ant-dropdown-menu-root"
                  >
                    {
                      this.state.contextMenuType === 'createPdl'
                        ? (
                          <li className="ant-dropdown-menu-item">
                            <a onClick={() => this.handleCreatePdlNode(context)}>
                              <FormattedMessage id="node.create.tenant" />
                            </a>
                          </li>
                        )
                        : (
                          <>
                            <li className="ant-dropdown-menu-item">
                              <a onClick={() => this.handleCreateNode(context)}>
                                <FormattedMessage id="node.create" />
                              </a>
                            </li>
                            <li className="ant-dropdown-menu-item">
                              <a onClick={() => this.handleModifyNode(context)}>
                                <FormattedMessage id="node.modify" />
                              </a>
                            </li>
                            <li className="ant-dropdown-menu-item">
                              <a onClick={() => this.handleDeleteNode(context)}>
                                <FormattedMessage id="node.delete" />
                              </a>
                            </li>
                            <li className="ant-dropdown-menu-item">
                              <a onClick={() => this.handleCopyPath(context)}>
                                <FormattedMessage id="node.copy.path" />
                              </a>
                            </li>
                          </>
                        )
                    }
                  </ul>
                </ContextMenu>
              )
            }
          </NsTreeContext.Consumer>
        </Spin>
      </div>
    );
  }
}

export default injectIntl(withRouter(NsTree));
