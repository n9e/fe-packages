## common components

### Tree

#### Example

```jsx
import React, { useState, useEffect, useMemo } from 'react';
import { TreeSelect } from 'antd';
import request from '@pkgs/request';
import api from '@pkgs/api';
import { normalizeTreeData, renderTreeNodes } from '@pkgs/Layout/utils';
import { TreeNode } from '@pkgs/interface';

export default function TreeDemo() {
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const treeNodes = useMemo(() => {
    return renderTreeNodes(treeData, 'treeSelect');
  }, [treeData]);
  
  useEffect(() => {
    request(api.tree).then((result) => {
      const treeData = normalizeTreeData(result);
      setTreeData(treeData);
    })
  }, []);
  return (
    <TreeSelect
      showSearch
      allowClear
      treeDefaultExpandAll
      treeNodeFilterProp="path"
      treeNodeLabelProp="path"
      dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
    >
      {treeNodes}
    </TreeSelect>
  )
}
```

### Graph

#### Example

```jsx
import Graph from '@pkgs/Graph';
<Graph
  data={{
    id: (new Date()).getTime(),
    title: '自定义标题，默认是节点和指标名称组合的名称',
    type: 'chart',
    start: 1597302022875,
    end: 1597305622875,
    linkVisible: false,
    metrics: [{
      endpointsKey: 'endpoints',
      selectedEndpoint: ['172.25.79.3', '10.86.76.13', '10.86.92.17'],
      selectedMetric: 'cpu.idle',
    }],
  }}
  graphConfigInnerVisible={false}
  extraRender={() => null}
/>
```

#### Props

```js
interface Props {
  data: {
    id: number;
    title?: string; // default: 节点和指标名称组合的名称
    type: 'chart';
    start: number; // 毫秒时间戳
    end: number;
    linkVisible?: boolean; // 是否显示右上角的下钻链接，default: true
    link?: string; // 下钻链接地址，default: ''
    metrics: {
      endpointsKey: 'endpoints';
      selectedNid?: number; // 已选节点id 当下面 selectedEndpoint 不为动态值时可以不填 nid,
      selectedEndpoint: string[]; // 已选 endpoint，可以填 ['=all'] 会动态拿上面 nid 下的所有 endpoints
      selectedMetric: string; // 指标名称
      selectedTagkv?: {
        tagk: string;
        tagv: string[];
      }[];
    }[];
  }
  graphConfigInnerVisible?: boolean; // 图表内行形态配置是否显示，开启状态需要其他配置具体联系 daixiaqing，default: true
  extraRender?: () => React.ReactNode; // 右上角一些操作项，不需要的话就支持 return null，有需要请单独联系 daixiaqing
}
```
