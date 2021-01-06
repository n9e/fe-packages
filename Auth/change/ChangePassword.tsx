import React, { useState, useEffect } from 'react';
import {
  Button,
  message,
  Form,
  Input,
  Icon,
  Card,
  Popover,
  Popconfirm,
} from 'antd';
import queryString from 'query-string';
import { RouteComponentProps } from 'react-router-dom';
import { FormComponentProps } from 'antd/lib/form';
import _ from 'lodash';
import request from '../../request';
import api from '../../api';
import './style.less';

const FormItem = Form.Item;

interface IPasswordProps extends FormComponentProps {}

const Password: React.FC<IPasswordProps & RouteComponentProps> = (props) => {
  const prefixCls = 'Electric-password';
  const { getFieldDecorator } = props.form;
  const query = queryString.parse(location.search) || {};
  const [errMessage, setMessage] = useState('');
  const [footer, setFooter] = useState({}) as any;
  const [total, setTotal] = useState(0);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    props.form.validateFields(async (err, values) => {
      if (!err) {
        if (values.newpass !== values.passwordConfirm) {
          message.error('两次密码输入不一致!');
          return;
        }
        try {
          await request(
            api.selftPassword,
            {
              method: 'PUT',
              body: JSON.stringify({
                ...values,
                username: query.username,
              }),
            },
            false
          ).then(() => setSuccess(true));
        } catch (catchErr) {
          setMessage(catchErr.toString());
          console.log(catchErr);
        }
      }
    });
  };

  const fetchConfig = () => {
    fetch('/static/passFeConfig.json')
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        setFooter(data);
        fetch('/api/platform/stats/visit/total')
          .then((res) => res.json())
          .then((data) => setTotal(data.dat.total));
      })
      .catch((e) => {
        console.log(e.message);
      });
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const content = (
    <div>
      {_.get(query, 'pwdRules[0]')}
      <br />
      {_.get(query, 'pwdRules[1]')}
    </div>
  );

  return (
    <div className={prefixCls}>
      <div className={`${prefixCls}-top`}>
        <img
          src={footer.header?.logo}
          alt="logo"
          style={{
            height: 50,
            width: 182,
            margin: 15,
          }}
        />
        <span className={`${prefixCls}-top-text`}>{footer.title}</span>
        <a className={`${prefixCls}-top-first`} href="/portal/home">
          首页
        </a>
        <span className={`${prefixCls}-top-line`}>|</span>
        <a className={`${prefixCls}-top-second`} href="/portal/document">
          文档中心
        </a>
      </div>
      {success ? (
        <Card
          className={`${prefixCls}-content-success`}
          title={
            <span style={{ fontSize: 16 }}>
              修改密码| <span style={{ fontSize: 12 }}>{query.reason}</span>
            </span>
          }
        >
          <div className={`${prefixCls}-content-success-content`}>
            <Icon
              className={`${prefixCls}-content-success-content-icon`}
              type="check-circle"
              theme="twoTone"
              twoToneColor="#52c41a"
              style={{ fontSize: '40px' }}
            />
            <div className={`${prefixCls}-content-success-content-text`}>
              重置密码成功,请重新登录！
            </div>
            <Button
              className={`${prefixCls}-content-success-content-btton`}
              type="primary"
              onClick={() =>  props.history.push({
                pathname: '/portal/home',
              })}
            >
              返回首页
            </Button>
          </div>
        </Card>
      ) : (
        <Card
          className={`${prefixCls}-content`}
          title={
            <span style={{ fontSize: 16 }}>
              修改密码 | <span style={{ fontSize: 12 }}>{query.reason}</span>
            </span>
          }
        >
          <Form
            layout="vertical"
            onSubmit={handleSubmit}
            style={{ width: 450, margin: 'auto' }}
          >
            <FormItem label="旧密码" required>
              {getFieldDecorator('oldpass', {
                rules: [{ required: true, message: '必填项！' }],
              })(
                <Input
                  prefix={
                    <Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />
                  }
                  placeholder="请输入旧密码"
                  type="password"
                />
              )}
            </FormItem>
            <Popover placement="right" content={content}>
              <FormItem label="新密码" required>
                {getFieldDecorator('newpass', {
                  rules: [{ required: true, message: '必填项！' }],
                })(
                  <Input
                    prefix={
                      <Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />
                    }
                    placeholder="请输入新密码"
                    type="password"
                  />
                )}
              </FormItem>
            </Popover>
            <FormItem label="确认输入新密码">
              {getFieldDecorator('passwordConfirm', {
                rules: [
                  { required: true, message: errMessage ? ' ' : '必填项！' },
                ],
              })(
                <Input
                  prefix={
                    <Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />
                  }
                  placeholder="请再次确认输入密码"
                  type="password"
                />
              )}
            </FormItem>
            {errMessage ? (
              <div style={{ color: 'red', marginTop: '-15px' }}>
                <Icon type="close-circle" />
                {errMessage?.replace('Error: ', '')}
              </div>
            ) : null}

            <FormItem>
              <Button
                type="primary"
                htmlType="submit"
                style={{ marginRight: 20 }}
              >
                确定
              </Button>
              <Popconfirm
                title="确认要取消，返回首页吗？"
                onConfirm={() => {
                  window.location.href = footer.home;
                }}
              >
                <Button>取消</Button>
              </Popconfirm>
            </FormItem>
          </Form>
        </Card>
      )}
      <div className={`${prefixCls}-bottom`}>
        <div className={`${prefixCls}-bottom-text`}>
          <span>{footer.loginFooter?.contactInfo[0]}</span>
          <span>{footer.loginFooter?.contactInfo[1]}</span>
          <span>
            {footer.loginFooter?.contactInfo[2]}
            {total}次
          </span>
        </div>
      </div>
    </div>
  );
};

export default Form.create()(Password);
