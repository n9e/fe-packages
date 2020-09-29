import React, { useState, useEffect } from 'react';
import { Select } from 'antd';
import _ from 'lodash';
import request from '../request';
import api from '../api';

interface IProps {
  valueKey?: 'id' | 'ident';
  style?: object;
  tenantIdent: string;
  tenantId: number;
  value?: any;
  onChange?: (newValue: any) => void;
}

interface IProject {
  id: number;
  ident: string;
  name: string;
}

export default function ProjectSelect(props: IProps) {
  const valueKey = props.valueKey || 'ident';
  const [data, setData] = useState<IProject[]>([]);

  useEffect(() => {
    if (props.tenantIdent || props.tenantId) {
      request(`${api.tree}/projs`).then((res) => {
        const key = props.tenantId ? 'id' : 'ident';
        const value = props.tenantId || props.tenantIdent;
        const tenantNodeId = _.get(_.find(res, { [key]: value }), 'id');
        const children: any[] = [];

        function getNodeChildren(data: any[], pid: number) {
          return _.forEach(data, (item) => {
            if (item.pid === pid) {
              children.push(item);
              getNodeChildren(data, item.id);
            }
          });
        }
        getNodeChildren(res, tenantNodeId);
        const projectData = _.filter(children, (item) => item.cate === 'project');
        setData(projectData);
      });
    } else {
      setData([]);
    }
  }, [props.tenantIdent || props.tenantId]);

  return (
    <Select
      allowClear={true}
      {...props}
    >
      {
        _.map(data, (item) => {
          return (
            <Select.Option key={item.ident} value={item[valueKey]}>
              {item.name}({item.ident})
            </Select.Option>
          );
        })
      }
    </Select>
  )
}
