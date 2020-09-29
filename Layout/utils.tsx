import React from 'react';
import _ from 'lodash';
import { Tree, TreeSelect, Tooltip } from 'antd';
import { FormattedMessage } from 'react-intl';
import { TreeNode } from '../interface';

export interface MenuConfItem {
  key?: string,
  name: string | React.ReactNode,
  path: string,
  icon?: string,
  children?: MenuConfItem[],
  visible?: boolean,
  rootVisible?: boolean,
  to?: string,
  divider?: boolean,
  target?: string,
  getQuery?: (query: any) => any,
}

// export interface TreeNode {
//   id: number,
//   pid: number,
//   ident: string,
//   name: string,
//   path: string,
//   type: number,
//   leaf: number,
//   children?: TreeNode[],
//   icon_color?: string,
//   icon_char?: string,
//   cate?: string,
//   note?: string,
//   selectable?: boolean,
// }

export function isAbsolutePath(url: string) {
  return /^https?:\/\//.test(url);
}

export function hasRealChildren(children: { visible?: boolean }[]) {
  if (_.isArray(children)) {
    return !_.every(children, (item) => item.visible === false);
  }
  return false;
}

export function getNsTreeVisible(activeRoutes: { nsTreeVisible?: boolean}[]) {
  return _.every(activeRoutes, (route) => route.nsTreeVisible === undefined || route.nsTreeVisible === true);
}

export function normalizeMenuConf(children: MenuConfItem[], parentNav?: MenuConfItem) {
  const navs: MenuConfItem[] = [];

  _.each(children, (nav) => {
    if (nav.visible === undefined || nav.visible === true) {
      const navCopy = _.cloneDeep(nav);

      if (isAbsolutePath(nav.path) || _.indexOf(nav.path, '/') === 0) {
        navCopy.to = nav.path;
      } else if (parentNav) {
        if (parentNav.path) {
          const parentPath = parentNav.to ? parentNav.to : `/${parentNav.path}`;
          if (nav.path) {
            navCopy.to = `${parentPath}/${nav.path}`;
          } else {
            navCopy.to = parentPath;
          }
        } else if (nav.path) {
          navCopy.to = `/${nav.path}`;
        }
      } else if (nav.path) {
        navCopy.to = `/${nav.path}`;
      }

      if (_.isArray(nav.children) && nav.children.length && hasRealChildren(nav.children)) {
        navCopy.children = normalizeMenuConf(nav.children, navCopy);
      } else {
        delete navCopy.children;
      }

      navs.push(navCopy);
    }
  });
  return navs;
}

export function findNode(nodes: TreeNode[], node: TreeNode) {
  let findedNode: TreeNode | undefined;
  function findNodeReal(nodes: TreeNode[], node: TreeNode) {
    for (let i = 0; i < nodes.length; i++) {
      const item = nodes[i];
      if (item.id === node.pid) {
        findedNode = item;
        break;
      } else if (Array.isArray(item.children)) {
        findNodeReal(item.children, node);
      }
    }
  }
  findNodeReal(nodes, node);
  return findedNode;
}

export function normalizeTreeData(dataSource: TreeNode[]) {
  const nodes: TreeNode[] = [];
  _.each(_.sortBy(dataSource, 'id'), (node) => {
    node = _.cloneDeep(node);
    if (node.pid === 0) {
      nodes.splice(_.sortedIndexBy(nodes, node, 'name'), 0, node);
    } else {
      const findedNode = findNode(nodes, node);
      if (!findedNode) return;
      if (_.isArray(findedNode.children)) {
        findedNode.children.splice(_.sortedIndexBy(findedNode.children, node, 'name'), 0, node);
      } else {
        findedNode.children = [node];
      }
    }
  });
  return nodes;
}

const treeIcon: (node: TreeNode) => JSX.Element = (node) => (
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

export function renderTreeNodes(nodes: TreeNode[], type = 'tree') {
  let TreeC: any = Tree;
  if (type === 'treeSelect') {
    TreeC = TreeSelect;
  }
  const renderTitle = (node: TreeNode) => {
    return (
      <Tooltip
        placement="right"
        title={
          <div>
            <div><FormattedMessage id="node.id.label" />: {node.id}</div>
            <div><FormattedMessage id="node.cate.label" />: {node.cate}</div>
            <div style={{ wordWrap: 'break-word', wordBreak: 'break-all' }}>
              <FormattedMessage id="node.note.label" />: {node.note}
            </div>
            <div style={{ wordWrap: 'break-word', wordBreak: 'break-all' }}>
              <FormattedMessage id="node.path.label" />: {node.path}
            </div>
          </div>
        }
      >
        <span>{node.name}</span>
      </Tooltip>
    );
  }
  return _.map(nodes, (node) => {
    if (_.isArray(node.children)) {
      return (
        <TreeC.TreeNode
          icon={treeIcon(node)}
          title={renderTitle(node)}
          key={String(node.id)}
          value={node.id}
          path={node.path}
          node={node}
          selectable={node.selectable === undefined ? true : node.selectable}
        >
          {renderTreeNodes(node.children, type)}
        </TreeC.TreeNode>
      );
    }
    return (
      <TreeC.TreeNode
        icon={treeIcon(node)}
        title={renderTitle(node)}
        key={String(node.id)}
        value={node.id}
        path={node.path}
        isLeaf={node.leaf === 1}
        node={node}
        selectable={node.selectable === undefined ? true : node.selectable}
      />
    );
  });
}

export function filterTreeNodes(nodes: TreeNode[], id: number) {
  let newNodes: TreeNode[] = [];
  function makeFilter(sNodes: TreeNode[]) {
    _.each(sNodes, (node) => {
      if (node.children) {
        if (node.id === id) {
          newNodes = node.children;
        } else {
          makeFilter(node.children);
        }
      }
    });
  }
  makeFilter(nodes);
  return newNodes;
}

export function getLeafNodes(nodes: TreeNode[], nids: number[]) {
  let leafNodes: TreeNode[] = [];
  function make(cnids: number[]) {
    const n: number[] = [];
    _.each(nodes, (node) => {
      if (_.includes(cnids, node.pid)) {
        if (node.leaf === 1) {
          leafNodes = _.concat(leafNodes, node.id as any);
        } else {
          n.push(node.id);
        }
      }
    });
    if (n.length) {
      make(n);
    }
  }
  make(nids);

  if (leafNodes.length) {
    return _.uniq(leafNodes);
  }
  return nids;
}


