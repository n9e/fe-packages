import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Input, Table, Col, Row } from 'antd';
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
  const [total, setTotal] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10)
  const [query, setQuery] = useState('');
  const [org, setOrg] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const handleSearch = (currentPage: Number, limit: number, value?: string, org?: string) => {
    if (currentPage) {
      request(`${api.users}?limit=${limit}&p=${currentPage}&query=${value}&org=${org}`).then((res) => {
        setData(res.list);
        setTotal(res.total);
      });
    } else {
      setData([]);
    }
  };

  const onShowSizeChange = (current: number, pageSize: number) => {
    setCurrentPage(current);
    setLimit(pageSize);
  };

  const currentOnChange = (current: number) => {
    setCurrentPage(current);
  }

  const showTotal = (total: number) => {
    return `共${total}条`
  }

  const throttleData = useCallback(_.throttle(handleSearch, 600), []);

  useMemo(() => throttleData(currentPage, limit, query, org), [query, org]);

  useEffect(() => {
    request(`${api.users}?limit=${limit}&p=${currentPage}`).then((res) => {
      setData(res.list);
      setTotal(res.total);
    });
  }, [limit, currentPage]);

  useEffect(() => {
    setSelectedRowKeys([]);
  }, [query, org])

  useEffect(() => {
    let isEmpty = true;
    let limit = 1;
    if (isArray(props.value)) {
      isEmpty = !props.value.length;
      limit = props.value.length;
    } else {
      isEmpty = props.value === undefined;
    }
  }, [props.value]);


  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedRowKeys: [], selectedRows: any) => {
      setSelectedRowKeys(selectedRowKeys);
      props.batchInputEnabled && props.optionKey === 'username' ?
        props.onChange(selectedRows.map((item: any) => item.username)) :
        props.onChange(selectedRows.map((item: any) => item.id));
    },
  };

  const columns = [
    {
      title: '显示名',
      dataIndex: 'dispname',
      key: 'dispname',
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
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
        rowKey={'id'}
        style={{ marginTop: 20 }}
        rowSelection={rowSelection}
        columns={columns}
        dataSource={data}
        size="small"
        scroll={{ y: 380 }}
        pagination={{
          defaultCurrent: 1,
          total: total,
          showTotal: showTotal,
          showSizeChanger: true,
          onShowSizeChange: onShowSizeChange,
          onChange: currentOnChange,
          pageSizeOptions: ['10', '50', '100', '500', '1000'],
        }}
        {...props}
      />
    </>
  )
}
