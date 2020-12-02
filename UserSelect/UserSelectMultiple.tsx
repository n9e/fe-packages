import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Input, Table, Col, Row, Select } from 'antd';
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

interface IParams {
  org: string;
  query: string;
  limit: number;
  currentPage: number;
}
export default function Index(props: IProps) {
  const { Option } = Select;
  const [data, setData] = useState<UserProfile[]>([]);
  const [total, setTotal] = useState();
  const [selectValue, setSelectValue] = useState('');
  const [params, setParams] = useState({ query: '', org: '', limit: 10, currentPage: 1 });
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [team, setTeam] = useState({ list: [] });
  const [teamMer, setTeamMer] = useState<number>();

  const handleSearch = (params: IParams) => {
    if (params.currentPage) {
      request(`${api.users}?limit=${params.limit}&p=${params.currentPage}&query=${params.query}&org=${params.org}`).then((res) => {
        setData(res.list);
        setTotal(res.total);
      });
    } else {
      setData([]);
    }
  };

  const handleTeam = (params: IParams) => {
    teamMer ? request(`${api.team}/${teamMer}?limit=${params.limit}&p=${params.currentPage}`).then((res) => {
      setData(res.list);
      setTotal(res.total);
    }) : null;
  };

  const onShowSizeChange = (current: number, pageSize: number) => {
    setParams({ ...params, limit: pageSize, currentPage: current });
  };

  const currentOnChange = (current: number) => {
    setParams({ ...params, currentPage: current })
  }

  const showTotal = (total: number) => {
    return `共${total}条`
  }

  const throttleData = useCallback(_.throttle(handleSearch, 300), []);

  useMemo(() => throttleData(params), [params]);

  useEffect(() => {
    selectValue === 'team' ? handleTeam(params) : handleSearch(params)
  }, [params.limit, params.currentPage]);

  useEffect(() => {
    handleTeam(params);
    setSelectedRowKeys([]);
  }, [teamMer]);

  useEffect(() => {
    setSelectedRowKeys([]);
  }, [params])

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

  useEffect(() => {
    request(`${api.teams}/all?limit=1000&p=1`).then((res) => {
      setTeam(res)
    });
  }, [])

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
        <Col span={6}>
          <Select
            defaultValue='username'
            style={{ width: 140 }}
            placeholder="请选择筛选方式"
            onChange={(value: string) => { setSelectValue(value); setParams({ org: '', query: '', limit: 10, currentPage: 1 }) }} >
            <Option value="username">用户名</Option>
            <Option value="organization">组织</Option>
            <Option value="team">团队</Option>
          </Select>
        </Col>
        <Col span={18}>
          {
            selectValue === 'team' ?
              <Select placeholder="请选择团队" onChange={(value: number) => { setTeamMer(value); setParams({ ...params, currentPage: 1 }) }}>
                {
                  team?.list.map((item: { name: string, id: number }) => {
                    return <Option value={item.id}>{item.name}</Option>
                  })
                }
              </Select>
              : selectValue === 'organization'
                ? <Input value={params.org} onChange={e => setParams({ ...params, org: e.target.value, currentPage: 1 })} placeholder="请输入组织名称" />
                : <Input value={params.query} onChange={e => setParams({ ...params, query: e.target.value, currentPage: 1 })} placeholder="请输入用户名称" />
          }
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
          current: params.currentPage,
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
