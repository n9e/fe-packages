import React, { useState, useEffect } from 'react';
import { Button } from 'antd';
import { RouteComponentProps } from 'react-router-dom';
import _ from 'lodash';
import request from '../request';
import api from '../api';

const Page403 = (props: RouteComponentProps) => {
  const { history } = props;
  const prefixCls = 'ecmc-exception';
  const [inProject, setInProject] = useState(true);

  useEffect(() => {
    request(`${api.tree}/projs`).then((res) => {
      const projectNodes = _.filter(res, (item) => {
        return item.cate === 'project';
      });
      if (!projectNodes.length) {
        setInProject(false);
      }
    });
  }, []);

  if (inProject) {
    return (
      <div className={prefixCls}>
        <div className={`${prefixCls}-main`}>
          <div className={`${prefixCls}-title`}>403</div>
          <div className={`${prefixCls}-content mb10`}>抱歉，你无权访问该页面</div>
          <Button
            icon="arrow-left"
            type="primary"
            onClick={() => {
              history.push({
                pathname: '/',
              });
            }}
          >
            返回首页
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={prefixCls}>
      <div className={`${prefixCls}-main`}>
        <div className={`${prefixCls}-title`}>403</div>
        <div className={`${prefixCls}-content mb10`}>请联系管理员添加项目</div>
      </div>
    </div>
  );
};

export default Page403;
