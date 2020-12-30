import React from 'react';
import { Button, Row, Col } from 'antd';
import { RouteComponentProps } from 'react-router-dom';

const img404 = require('./imgs/403Img.png');

const Page404: React.FC<RouteComponentProps> = (props) => {
  const { history } = props;
  const prefixCls = 'ecmc-exception';

  return (
    <div className={`${prefixCls} ${prefixCls}-403`}>
      <div className={`${prefixCls}-main`}>
        <Row gutter={200}>
          <Col span={12}>
            <img src={img404} alt="404" />
          </Col>
          <Col span={12}>
            <div className={`${prefixCls}-title`}>404</div>
            <div className={`${prefixCls}-content mb10`}>抱歉，你访问的页面不存在</div>
            <Button
              className={`${prefixCls}-btn`}
              type="primary"
              onClick={() => {
                history.push({
                  pathname: '/',
                });
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

export default Page404;
