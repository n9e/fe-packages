import React, { useState, useEffect } from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import queryString from 'query-string';
import _ from 'lodash';
import { TreeNode } from '../interface';
import api from '../api';
import request from '../request';
import { normalizeTreeData } from './utils';

interface Props extends RouteComponentProps {
  treeVisible: boolean,
  children: React.ReactNode,
}

export interface State {
  treeLoading: boolean,
  selectedNode?: TreeNode,
  treeData: TreeNode[],
  treeNodes: TreeNode[],
  expandedKeys: string[],
  treeSearchValue: string,
  reloadflag: number,
}

export interface NsTreeContextData {
  data: State,
  nsTreeVisible: boolean,
  nsTreeArrowVisible: boolean;
  nsTreeVisibleChange: (visible: boolean, isUserClick?: boolean, arrowVisible?: boolean) => void,
  getTreeData: () => void,
  getTreeNodes: () => void,
  appendTreeNode: (node: TreeNode, treeData?: TreeNode[]) => TreeNode[],
  updateTreeNode: (nid: number, node: TreeNode) => void,
  removeTreeNode: (nid: number) => void,
  selecteTreeNode: (node?: TreeNode) => void,
  getSelectedNode: (key?: string) => void,
  deleteSelectedNode: () => void,
  reload: () => void,
  setTreeSearchValue: (newTreeSearchValue: string) => void,
  setExpandedKeys: (newExpandedKeys: string[]) => void,
}

export const NsTreeContext = React.createContext({} as NsTreeContextData);

const getDefaultKeys = (treeNodes: TreeNode[], selectedNode: TreeNode) => {
  const filteredNode = _.find(treeNodes, { id: selectedNode.id });
  const keys = [] as number[];

  function realFind(activeNode: TreeNode) {
    const node = _.find(treeNodes, { id: activeNode.pid });
    if (node) {
      keys.push(node.id);
      realFind(node);
    }
  }

  if (filteredNode) realFind(filteredNode);

  return _.union(_.map(keys, (key) => String(key)));
};

const getSearchResultKeys = (treeNodes: TreeNode[], treeSearchValue: string) => {
  const keys = [] as number[];

  function realFind(activeNode: TreeNode) {
    const node = _.find(treeNodes, { id: activeNode.pid });
    if (node) {
      keys.push(node.id);
      realFind(node);
    }
  }

  _.each(treeNodes, (node) => {
    realFind(node);
  });

  return _.union(_.map(keys, (key) => String(key)));
};

const Provider = ({ treeVisible = true, children, location }: Props) => {
  const selectedNodeCache = window.localStorage.getItem('selectedNode');
  let selectedNode;
  try {
    selectedNode = selectedNodeCache ? JSON.parse(selectedNodeCache) : undefined;
  } catch (e) {
    console.log(e);
  }

  if (location.search && selectedNode) {
    const query = queryString.parse(location.search);
    if (query.nid && selectedNode.id !== Number(query.nid)) {
      selectedNode = { id: Number(query.nid) };
    }
  }

  const [state, setState] = useState<State>({
    treeData: [],
    treeNodes: [],
    treeLoading: false,
    treeSearchValue: '',
    expandedKeys: [],
    reloadflag: 1,
    selectedNode,
  });
  const [nsTreeVisible, setNsTreeVisible] = useState<boolean>(false);
  const [nsTreeArrowVisible, setNsTreeArrowVisible] = useState<boolean>(false);

  if (treeVisible) {
    useEffect(() => {
      const fetchData = async () => {
        const treeData = await request(`${api.tree}?${queryString.stringify({ query: state.treeSearchValue })}`) as TreeNode[];
        const treeNodes = normalizeTreeData(_.cloneDeep(treeData));
        let expandedKeys = [] as string[];
        if (state.selectedNode) {
          expandedKeys = getDefaultKeys(treeData, state.selectedNode);
        }
        if (state.treeSearchValue) {
          expandedKeys = getSearchResultKeys(treeData, state.treeSearchValue);
        }
        setState({
          ...state, treeData, treeNodes, expandedKeys,
        });
      };
      fetchData();
    }, [state.treeSearchValue, state.reloadflag]);
  }

  useEffect(() => {
    window.addEventListener('message', (event) => {
      const { data } = event;
      if (_.isPlainObject(data) && data.type === 'nsTreeVisible') {
        setNsTreeVisible(data.value);
      }
    }, false);
  }, []);

  return (
    <NsTreeContext.Provider
      value={{
        data: state,
        nsTreeVisible,
        nsTreeArrowVisible,
        nsTreeVisibleChange: (visible: boolean, isUserClick = false, arrowVisible = false) => {
          if (isUserClick) {
            window.localStorage.setItem('nstree-visible', String(visible));
            setNsTreeVisible(visible);
          } else {
            const cache = window.localStorage.getItem('nstree-visible');
            if (cache !== null && arrowVisible) {
              setNsTreeVisible(cache === 'true');
            } else {
              setNsTreeVisible(visible);
            }
          }
          setNsTreeArrowVisible(arrowVisible);
        },
        getTreeData: () => _.cloneDeep(state.treeData),
        getTreeNodes: () => _.cloneDeep(state.treeNodes),
        appendTreeNode: (treeNode, treeData) => {
          const treeDataClone = _.cloneDeep(treeData ? treeData : state.treeData) || [];
          treeDataClone.push(treeNode);
          const treeNodes = normalizeTreeData(treeDataClone);
          setState({ ...state, treeData: treeDataClone, treeNodes });
          return treeDataClone;
        },
        updateTreeNode: (treeNodeId, treeNode) => {
          const treeDataClone = _.filter(state.treeData, (item) => item.id !== treeNodeId);
          treeDataClone.push(treeNode);
          const treeNodes = normalizeTreeData(treeDataClone);
          setState({ ...state, treeData: treeDataClone, treeNodes });
        },
        removeTreeNode: (treeNodeId) => {
          const treeDataClone = _.filter(state.treeData, (item) => item.id !== treeNodeId);
          const treeNodes = normalizeTreeData(treeDataClone);
          setState({ ...state, treeData: treeDataClone, treeNodes });
        },
        selecteTreeNode: (node) => {
          if (node) {
            try {
              window.localStorage.setItem('selectedNode', JSON.stringify(node));
            } catch (e) {
              console.log(e);
            }
          } else {
            window.localStorage.removeItem('selectedNode');
          }
          setState({ ...state, selectedNode: node });
        },
        getSelectedNode: (key) => {
          const { treeData, selectedNode } = state;

          if (selectedNode && _.isPlainObject(selectedNode)) {
            if (_.find(treeData, { id: selectedNode.id })) {
              if (!key) {
                return { ...selectedNode };
              }
              return _.get(selectedNode, key);
            }
            return undefined;
          }
          return undefined;
        },
        deleteSelectedNode: () => {
          try {
            window.localStorage.removeItem('selectedNode');
          } catch (e) {
            console.log(e);
          }
          setState({ ...state, selectedNode: undefined });
        },
        reload: () => {
          setState({ ...state, reloadflag: state.reloadflag + 1 });
        },
        setTreeSearchValue: (newTreeSearchValue) => {
          setState({ ...state, treeSearchValue: newTreeSearchValue });
        },
        setExpandedKeys: (newExpandedKeys) => {
          setState({ ...state, expandedKeys: newExpandedKeys });
        },
      }}
    >
      {children}
    </NsTreeContext.Provider>
  );
};

export default withRouter(Provider);
