import React, { useEffect, useState } from 'react';
import request from '../request';
import { Button } from 'antd';
import api from '../api';
import './style.less';

const CallBack = () => {
  const [redirect, setRedirect] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const [loginMsg, setLoginMsg] = useState(true);
  const { search } = location;

  const value = async () => {
    try {
      const data = await request(api.callback + search);
      setRedirect(data.redirect);
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
        <div className="callBack-urlImg">
          <div className="callBack-urlImg-txt">
            <div className="callBack-urlImg-400">400</div>
            <p className="callBack-urlImg-p">{errMsg}</p>
            <Button type="primary" onClick={handlerReturn}>
              返回首页
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CallBack;
