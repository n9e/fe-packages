import React, { useState, useEffect } from 'react';
import { Select, Input, Modal } from 'antd';
import map from 'lodash/map';
import unionBy from 'lodash/unionBy';
import isArray from 'lodash/isArray';
import split from 'lodash/split';
import request from '@pkgs/request';
import api from '@pkgs/api';
import { UserProfile } from '../interface';

interface Props {
  batchInputEnabled?: boolean;
  mode?: any;
  optionKey?: string;
  value?: any;
  onChange?: any;
}

export default function index(props: Props) {
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState<UserProfile[]>([]);
  const handleSearch = (value: string) => {
    if (value) {
      request(`${api.users}?limit=1000&query=${value}`).then((res) => {
        setData(res.list);
      });
    } else {
      setData([]);
    }
  };

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
        placeholder="input seach text"
        filterOption={false}
        notFoundContent={null}
        defaultActiveFirstOption={false}
        showArrow={false}
        {...props}
      >
        {
          map(data, (item) => {
            return (
              <Select.Option
                key={item[(props.optionKey || 'id') as 'id']}
                value={item[(props.optionKey || 'id') as 'id']}
              >
                {item.dispname}({item.username})
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
  )
}
