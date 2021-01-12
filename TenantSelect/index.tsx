import React, { useState, useEffect } from 'react';
import { Select } from 'antd';
import _ from 'lodash';
import request from '../request';
import api from '../api';

interface IProps {
  valueMode: 'mine' | 'all';
  valueKey?: 'id' | 'ident';
  hasUnTenant?: boolean;
  style?: Object;
  value?: any;
  placeholder?: any;
  onChange?: (newValue: any) => void;
}

interface ITenant {
  id?: number;
  pid: number;
  ident: string;
  name: string;
  cate: string;
}

export default function TenantSelect(props: IProps) {
  const valueMode = props.valueMode || 'mine';
  const valueKey = props.valueKey || 'ident';
  const [data, setData] = useState<ITenant[]>([]);

  useEffect(() => {
    if (valueMode === 'mine') {
      request(`${api.tree}/projs`).then((res) => {
        const unTenant = [{ pid: 0, ident: '0', name: '未分配租户', cate: 'tenant' }];
        let newData = res;
        if (props.hasUnTenant) {
          newData = _.concat(unTenant, res);
        }
        setData(_.filter(newData, item => item.cate === 'tenant'));
      });
    } else if (valueMode === 'all') {
      request(`${api.nodes}?cate=tenant&inner=1`).then((res) => {
        setData(res);
      });
    }
  }, []);

  return (
    <Select
      dropdownMatchSelectWidth={false}
      allowClear
      {...props}
    >
      {
        _.map(data, (item) => {
          return (
            <Select.Option key={item.id} value={item[valueKey]}>
              {item.name}{!item.id ? null : <span>({item.ident})</span>}
            </Select.Option>
          );
        })
      }
    </Select>
  );
}
