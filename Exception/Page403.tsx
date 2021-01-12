import React, { useState, useEffect } from 'react';
import { Button, Row, Col } from 'antd';
import _ from 'lodash';
import queryString from 'query-string';
import request from '../request';
import api from '../api';

const img403 = require('./imgs/403Img.png');

const Page403 = (props: any) => {
  const search = _.get(props, 'location.search');
  const query = queryString.parse(search);
  const prefixCls = 'ecmc-exception';
  const [inProject, setInProject] = useState(true);

  useEffect(() => {
    if (query.cause === 'noproj') {
      request(`${api.tree}/projs`).then((res) => {
        const projectNodes = _.filter(res, (item) => {
          return item.cate === 'project';
        });
        if (!projectNodes || !projectNodes.length) {
          setInProject(false);
        }
      });
    }
  }, []);

  return (
    <div className={`${prefixCls} ${prefixCls}-403`}>
      <div className={`${prefixCls}-main`}>
        <Row gutter={200}>
          <Col span={12}>
            <img src={img403} alt="403" />
          </Col>
          <Col span={12}>
            <div className={`${prefixCls}-title`}>403</div>
            <div className={`${prefixCls}-content`}>
              {inProject ? '抱歉，你无权访问该页面' : '请联系管理员添加项目'}
            </div>
            <Button
              className={`${prefixCls}-btn`}
              type="primary"
              onClick={() => {
                window.location.href = window.location.origin;
              }}
            >
              返回首页
            </Button>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Page403;
