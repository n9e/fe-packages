import React, { useState, useEffect } from 'react';
import { Select } from 'antd';
import _ from 'lodash';
import request from '../request';
import api from '../api';

interface IProps {
  valueMode: 'mine' | 'all';
  valueKey?: 'id' | 'ident';
  style?: object;
  value?: any;
  onChange?: (newValue: any) => void;
}

interface ITenant {
  id: number;
  ident: string;
  name: string;
}

export default function TenantSelect(props: IProps) {
  const valueMode = props.valueMode || 'mine';
  const valueKey = props.valueKey || 'ident';
  const [data, setData] = useState<ITenant[]>([]);

  useEffect(() => {
    if (valueMode === 'mine') {
      request(`${api.tree}/projs`).then((res) => {
        setData(_.filter(res, (item) => item.cate === 'tenant'));
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
      allowClear={true}
      {...props}
    >
      {
        _.map(data, (item) => {
          return (
            <Select.Option key={item.id} value={item[valueKey]}>
              {item.name}({item.ident})
            </Select.Option>
          );
        })
      }
    </Select>
  )
}
