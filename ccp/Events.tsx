
import React, { useState, useEffect } from 'react';
import { Table, Tooltip } from 'antd';
import moment from 'moment';
import { ColumnProps } from 'antd/lib/table';
import useFormatMessage from '../hooks/useFormatMessage';
import request from '../request';
import api from '../api';
import { Events } from './interface';

interface Props {
  type: string,
  region: string,
  namespace: string,
  adminName: string
}

const index = (props: Props) => {
  const intlFmtMsg = useFormatMessage();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // 获取详情
    request(`${api.cluster}/${props.region}/namespace/default/${props.type}s/${props.adminName}/events`).then((res) => {
      const data=res||[];
      data.forEach((obj: Events, index: number) => {
        obj.key = index;
      });
      setEvents(data);
    });
  }, []);

  const columns: ColumnProps<Events>[] = [
    {
      title: intlFmtMsg({ id: 'resource.kind' }),
      dataIndex: 'kind',
      render: (text: string, record: Events) => `${_.get(record, 'involvedObject.kind', '')}`,
    }, {
      title: intlFmtMsg({ id: 'level' }),
      dataIndex: 'type',
    }, {
      title: intlFmtMsg({ id: 'number' }),
      dataIndex: 'count',
    }, {
      title: intlFmtMsg({ id: 'content' }),
      dataIndex: 'reason',
      render: (text: string) => (
        <Tooltip title={text}>
          <span className="text-overflow inline-block w150">{text || '-'}</span>
        </Tooltip>
      ),
    }, {
      title: intlFmtMsg({ id: 'infomation' }),
      dataIndex: 'message',
      render: (text: string) => (
        <Tooltip title={text}>
          <span className="text-overflow inline-block w150">{text || '-'}</span>
        </Tooltip>
      ),
    }, {
      title: intlFmtMsg({ id: 'firstTimestamp' }),
      dataIndex: 'firstTimestamp',
      render: (text: string) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
    }, {
      title: intlFmtMsg({ id: 'lastTransitionTime' }),
      dataIndex: 'lastTransitionTime',
      render: (text: string) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
    }
  ];

  return (
    <Table
      size="small"
      columns={columns}
      dataSource={events}
     />
  );
};

export default index;
