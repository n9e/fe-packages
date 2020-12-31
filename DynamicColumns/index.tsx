import React, { useState, useEffect } from 'react';
import { Popconfirm, Checkbox, Button } from 'antd';
import useFormatMessage, { getIntl } from '../hooks/useFormatMessage';
import _ from 'lodash';
import './style.less';

interface IOption {
  label: string,
  value: string,
};

interface IProps {
  targetType: 'button' | 'string',
  uid: string; // 用于数据本地缓存的 key
  options: IOption[];
  value: string[];
  onChange: (newValue: string[]) => void;
}

export default function index(props: IProps) {
  const intl = getIntl();
  const intlFmtMsg = useFormatMessage();
  const cached = window.localStorage.getItem(`dynamic-columns-${props.uid}`);
  let defaultKeys = props.value;

  useEffect(() => {
    if (cached) {
      defaultKeys = JSON.parse(cached);
      props.onChange(defaultKeys);
    }
  }, []);

  const [checkedKeys, setCheckedKeys] = useState(defaultKeys);

  return (
    <Popconfirm
      icon={null}
      placement="rightTop"
      title={(
        <div style={{ marginLeft: -15 }}>
          <h3 className="mb10">{intlFmtMsg({ id: 'choose.columns' })}</h3>
          <Checkbox.Group
            defaultValue={defaultKeys}
            onChange={(keys) => {
              setCheckedKeys(keys as string[]);
            }}
          >
            {
              _.map(props.options, (item) => (
                <Checkbox key={item.value} value={item.value} className="dynamic-columns-option">{item.label}</Checkbox>
              ))
            }
          </Checkbox.Group>
        </div>
      )}
      onConfirm={() => {
        window.localStorage.setItem(`dynamic-columns-${props.uid}`, JSON.stringify(checkedKeys));
        props.onChange(checkedKeys);
      }}
    >
      {
        !props.targetType || props.targetType === 'button' ?
          <Button type="primary">
            {intlFmtMsg({ id: 'display.columns' })}
          </Button> :
          <a>{intlFmtMsg({ id: 'display.columns' })}</a>
      }
    </Popconfirm>
  )
}
