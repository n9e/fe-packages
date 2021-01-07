import React, { useEffect, useState } from 'react';
import request from '../request';
import { Button, Row, Col } from 'antd';
import api from '../api';
import './style.less';

const img403 = require('./assets/400Img.png');


const CallBack = () => {
  const prefixCls = 'ecmc-exception';
  const [redirect, setRedirect] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const [loginMsg, setLoginMsg] = useState(true);
  const { search } = location;

  const value = async () => {
    try {
      const data = await request(api.callback + search, "" , false);
      setRedirect(data.redirect);
      localStorage.setItem('accessToken', data.accessToken);
    } catch (e) {
      setErrMsg(e.toString());
      setLoginMsg(false);
    }
  };

  const handlerReturn = () => {
    window.location.href = '/rdb';
  };

  useEffect(() => {
    value();
  }, []);

  useEffect(() => {
    if (redirect) {
      window.location.href = redirect;
    }
  }, [redirect]);
  return (
    <div>
      {loginMsg ? (
        <div>loading.....</div>
      ) : (
          <div className={`${prefixCls} ${prefixCls}-400`}>
            <div className={`${prefixCls}-main`}>
              <Row gutter={100}>
                <Col span={12}>
                  <img src={img403} alt="400" />
                </Col>
                <Col span={12}>
                  <div className={`${prefixCls}-title`}>400</div>
                  <div className={`${prefixCls}-content`}>{errMsg} </div>
                  <Button
                    className={`${prefixCls}-btn`}
                    type="primary"
                    onClick={handlerReturn}
                  >
                    返回首页
                  </Button>
                </Col>
              </Row>
            </div>
          </div>
        )}
    </div>
  );
};

export default CallBack;
