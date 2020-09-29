/*
  * 1. 从接口 /api/uic/habits/identity 获取 identity
  * 2. 根据 endpoint 从  /api/hsp/host/search?bath=endpoint&field=identity 拿到pod的name，
       如果类型是container再做后续操作，如果是其他类型则不展示小图标终止操作
  * 3. 根据 /api/ccpapi/xxx（接口待提供）拿到 pod 所属的集群
  * 4. 根据 /api/ccpapi/cluster/:cluster/namespace/default/pods/:name
  *     拿到 pod 的基本信息 + 运行状态
  * 5. 根据 /api/ccpapi/cluster/:cluster/namespace/default/pods/:name/events
  *     拿到 pod 相关事件
*/
import React, { useState, useEffect } from 'react';
import { Icon, Drawer, Card, Table, Tooltip, Row, Col } from 'antd';
import _ from 'lodash';
import api from '../api';
import moment from 'moment';
import request from '../request';
import useFormatMessage from '../hooks/useFormatMessage';
import { ColumnProps } from 'antd/lib/table';
import { RunningState } from './interface';
import Events from './Events';
import './style.less';

interface Props {
  endpoint: string,
}

const index = (props: Props) => {
  const intlFmtMsg = useFormatMessage();
  const [podname, setPodname] = useState('');
  const [category, setCategory] = useState('');
  const [showDrawer, setShowDrawer] = useState(false);
  const [cluster, setCluster] = useState('');
  const [detailObj, setDetailObj] = useState({});

  useEffect(() => {
    // 获取identity
    request(`${api.habits}/identity`).then((res) => {
      request(`${api.host}/search?batch=${props.endpoint}&field=${res}`).then((res) => {
        setCategory(_.get(res, '0.cate'));
        setPodname(_.get(res, '0.name')); //测试数据
      });
    });
  }, []);

  function getCluster() {
    request(`${api.cluster}-get-by-pod?name=${podname}`).then((res) => {
      setCluster(res);
      if(res){
        setShowDrawer(true);
        getPodStatus(res);
      }
    });
  }

  function getPodStatus(cluster: string) {
    request(`${api.cluster}/${cluster}/namespace/default/pods/${podname}`).then((res) => {
      setDetailObj(res);
    });
  }

  const columns: ColumnProps<RunningState>[] = [
    {
      title: intlFmtMsg({ id: 'volumes.type' }),
      dataIndex: 'type',
      key: 'type',
    }, {
      title: intlFmtMsg({ id: 'task.status' }),
      dataIndex: 'status',
      key: 'status',
    }, {
      title: intlFmtMsg({ id: 'app.updated.at' }),
      dataIndex: 'lastTransitionTime',
      key: 'lastTransitionTime',
      render: (text: string) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
    }, {
      title: intlFmtMsg({ id: 'reason' }),
      dataIndex: 'reason',
      key: 'reason',
      render: (text: string) => (
        <Tooltip title={text}>
          <span className="text-overflow inline-block w200">{text || '-'}</span>
        </Tooltip>
      ),
    }, {
      title: intlFmtMsg({ id: 'infomation' }),
      dataIndex: 'message',
      key: 'message',
      render: (text: string) => (
        <Tooltip title={text}>
          <span className="text-overflow inline-block w200">{text || '-'}</span>
        </Tooltip>
      ),
    },
  ];

  return (
    <div style={{ display: 'inline-block' }}>
      { props.endpoint }
      { category === 'container' &&
        <a href="javascript:;" className="ml-5">
          <Icon type="eye" onClick={()=>{
            getCluster();
          }}/>
        </a>
      }
      { showDrawer &&
        <Drawer
          width={900}
          className="odin-drawer"
          title={ intlFmtMsg({ id: 'table.detail' }) }
          placement="right"
          onClose={()=>{setShowDrawer(false)}}
          visible={true}
        >
          <Card title={intlFmtMsg({ id: 'basic.info' })} bordered={false} className="odin-card">
            <div className="odin-card-body">
              <div className="odin-info-list">
                <Row>
                  <Col span={4}>{ intlFmtMsg({ id: 'app.name' }) }：</Col>
                  <Col span={8}>{ _.get(detailObj, 'metadata.name') }</Col>
                  <Col span={4}>{ intlFmtMsg({ id: 'task.created' }) }：</Col>
                  <Col span={8}>{ moment(_.get(detailObj, 'metadata.creationTimestamp')).format('YYYY-MM-DD HH:mm:ss') }</Col>
                </Row>
                <Row>
                  <Col span={4}>{ intlFmtMsg({ id: 'namespace' }) }：</Col>
                  <Col span={8}>{ _.get(detailObj, 'metadata.namespace') }</Col>
                  <Col span={4}>{ intlFmtMsg({ id: 'task.status' }) }：</Col>
                  <Col span={8}>{ _.get(detailObj, 'status.phase') }</Col>
                </Row>
                <Row>
                  <Col span={4}>{ intlFmtMsg({ id: 'node' }) }：</Col>
                  <Col span={8}>{ _.get(detailObj, 'spec.nodeName') }</Col>
                  <Col span={4}>PodIP：</Col>
                  <Col span={8}>{ _.get(detailObj, 'status.podIP') }</Col>
                </Row>
                <Row>
                  <Col span={4}>hostIP</Col>
                  <Col span={8}>{_.get(detailObj, 'status.hostIP')}</Col>
                </Row>
              </div>
            </div>
          </Card>
          <Card title={intlFmtMsg({ id: 'running.state' })} bordered={false} className="odin-card">
            <div className="odin-card-body">
              <div className="odin-info-list">
                <Table
                  size="small"
                  rowKey="type"
                  columns={columns}
                  dataSource={_.get(detailObj, 'status.conditions') || []}
                />
              </div>
            </div>
          </Card>
          <Card title={intlFmtMsg({ id: 'event' })} bordered={false} className="odin-card">
            <div className="odin-card-body">
              <div className="odin-info-list">
                <Events
                  type='pod'
                  region={cluster}
                  namespace='default'
                  adminName={podname}
                 />
              </div>
            </div>
          </Card>
        </Drawer>
      }
    </div>
  )
}

export default index;

