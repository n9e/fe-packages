import React, { useState, useEffect } from 'react';
import { Select } from 'antd';
import _ from 'lodash';
import request from '../request';
import api from '../api';

interface IProps {
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
  const valueKey = props.valueKey || 'ident';
  const [data, setData] = useState<ITenant[]>([]);

  useEffect(() => {
    request(`${api.tree}/projs`).then((res) => {
      setData(_.filter(res, (item) => item.cate === 'tenant'));
    });
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
