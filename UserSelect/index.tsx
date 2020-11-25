import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Input, Table, Col, Row } from 'antd';
import unionBy from 'lodash/unionBy';
import isArray from 'lodash/isArray';
import request from '@pkgs/request';
import api from '@pkgs/api';
import { UserProfile } from '../interface';
import _ from 'lodash';

interface IProps {
  batchInputEnabled?: boolean;
  mode?: any;
  optionKey?: string;
  value?: any;
  onChange?: (data: any) => void;
}

export default function Index(props: IProps) {
  const [data, setData] = useState<UserProfile[]>([]);
  const [query, setQuery] = useState('');
  const [org, setOrg] = useState('');
  const handleSearch = (value: string, org: string) => {
    if (value) {
      request(`${api.users}?limit=1000&query=${value}&org=${org}`).then((res) => {
        setData(res.list);
      });
    } else {
      setData([]);
    }
  };

  const throttleData = useCallback(_.throttle(handleSearch, 600), []);

  useMemo(() => throttleData(query, org), [query, org]);


  useEffect(() => {
    let isEmpty = true;
    let limit = 1;
    if (isArray(props.value)) {
      isEmpty = !props.value.length;
      limit = props.value.length;
    } else {
      isEmpty = props.value === undefined;
    }
    if (!isEmpty) {
      request(`${api.users}?limit=${limit}&ids=${props.value}`).then((res) => {
        setData(unionBy(data, res.list, 'id'));
      });
    }
  }, [props.value]);

  const rowSelection = {
    onChange: (selectedRowKeys: any, selectedRows: any) => {
      props.batchInputEnabled && props.optionKey === 'username' ?
        props.onChange(selectedRows.map((item: any) => item.username)) :
        props.onChange(selectedRows.map((item: any) => item.id));
    },
  };

  const columns = [
    {
      title: '显示名',
      dataIndex: 'dispname',
    },
    {
      title: '用户名',
      dataIndex: 'username',
    },
    {
      title: '组织',
      dataIndex: 'organization',
    }, {
      title: '邮箱',
      dataIndex: 'email',
    }
  ];

  return (
    <>
      <Row>
        <Col span={12}>
          <Input style={{ width: 290 }} addonBefore="用户名" onChange={e => setQuery(e.target.value)} />
        </Col>
        <Col span={10}>
          <Input style={{ width: 295 }} addonBefore="组织" onChange={e => setOrg(e.target.value)} />
        </Col>
      </Row>
      <Table
        style={{ marginTop: 20 }}
        rowSelection={rowSelection}
        columns={columns}
        dataSource={data}
        size="small"
        {...props}
      />
    </>
  )
}
