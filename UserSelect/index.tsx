import React, { useState, useEffect } from 'react';
import { Select, Input, Modal } from 'antd';
import queryString from 'query-string';
import map from 'lodash/map';
import get from 'lodash/get';
import unionBy from 'lodash/unionBy';
import isArray from 'lodash/isArray';
import split from 'lodash/split';
import debounce from 'lodash/debounce';
import request from '@pkgs/request';
import api from '@pkgs/api';
import { UserProfile } from '../interface';

interface Props {
  batchInputEnabled?: boolean;
  mode?: any;
  optionKey?: string;
  placeholder?: string;
  value?: any;
  onChange?: any;
  className?: string;
  optionLabelProp?: string;
  org?: string; // 组织、租户，目前只有部分环境需要
}

export default function index(props: Props) {
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState<UserProfile[]>([]);
  const [feConf, setFeConf] = useState<any>({});
  const handleSearch = debounce((value: string) => {
    if (value) {
      const query = {
        limit: 100,
        query: value,
        org: feConf.header.mode === 'complicated' && props.org ? props.org : '',
      };
      request(`${api.users}?${queryString.stringify(query)}`).then((res) => {
        setData(res.list);
      });
    } else {
      setData([]);
    }
  }, 500);

  useEffect(() => {
    fetch('/static/feConfig.json')
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        setFeConf(res);
      });
  }, []);

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

  return (
    <>
      <Select
        style={{ minWidth: 150 }}
        allowClear
        showSearch
        onSearch={handleSearch}
        placeholder="请输入用户名"
        filterOption={false}
        notFoundContent={null}
        defaultActiveFirstOption={false}
        showArrow={false}
        {...props}
      >
        {
          map(data, (item: any) => {
            return (
              <Select.Option
                key={item[(props.optionKey || 'id')]}
                value={item[(props.optionKey || 'id')]}
                label={get(item, 'dispname')}
              >
                <div>{get(item, 'dispname')} {get(item, 'organization') ? (get(item, 'organization')) : ''}</div>
                <div style={{ color: '#999', fontSize: 10 }}>{item.email}</div>
              </Select.Option>
            );
          })
        }
      </Select>
      {
        props.batchInputEnabled && props.optionKey === 'username' ?
          <>
            <a style={{ marginTop: 5, display: 'inline-block' }} onClick={() => { setVisible(true); }}>批量录入</a>
            <Modal
              title="批量录入"
              visible={visible}
              onOk={() => {
                setVisible(false);
              }}
              onCancel={() => {
                setVisible(false);
              }}
            >
              <Input.TextArea
                placeholder="多个用户名，换行分割"
                onChange={(e: any) => {
                  const value = split(e.target.value, '\n');
                  props.onChange(value);
                }}
              />
            </Modal>
          </> : null
      }
    </>
  );
}
