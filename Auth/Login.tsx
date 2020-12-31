import React, { Component } from 'react';
import { Form, Input, Icon, Button, Checkbox, Row, Col } from 'antd';
import { RouteComponentProps } from 'react-router-dom';
import queryString from 'query-string';
import { FormProps } from 'antd/lib/form';
import _ from 'lodash';
import {
  FormattedMessage,
  injectIntl,
  WrappedComponentProps,
} from 'react-intl';
import auth from './auth';
import * as loginBackgroundAnimation from './loginBackgroundAnimation';
import request from '../request';
import api from '../api';
import './style.less';

const FormItem = Form.Item;

class Login extends Component<
  RouteComponentProps & FormProps & WrappedComponentProps
> {
  state = {
    ldapUsed: false,
    isRender: false,
  };
  textInput: any;

  componentWillMount() {
    this.fetchData();
  }

  componentWillUnmount() {
    const ele = document.getElementById('login-bg-canvas');
    if (ele && ele.parentNode) {
      ele.parentNode.removeChild(ele);
    }
  }

  fetchData() {
    const { location } = this.props;
    const { search } = location;
    const query = queryString.parse(search);
    request(`${api.ldap}/used`).then((res) => {
      this.setState({ ldapUsed: res });
    });
    // TODO: 如果开启了 sso 则自动跳转到 sso
    const redirect = query.redirect || '/';
    request(api.authorize + '?redirect=' + redirect).then((res) => {
      if (res && res.redirect && res.redirect !== '/login') {
        window.location.href = res.redirect;
      } else {
        loginBackgroundAnimation.init();
        loginBackgroundAnimation.animate();
        this.setState({ isRender: true });
      }
    });
  }

  handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { history, location } = this.props;
    const { search } = location;

    this.props.form!.validateFields((err, values) => {
      if (!err) {
        auth.authenticate(
          {
            ...values,
            is_ldap: values.is_ldap ? 1 : 0,
          },
          () => {
            const query = queryString.parse(search);
            const locationState = location.state as any;
            if (query.redirect && query.sig) {
              if (query.redirect.indexOf('?') > -1) {
                window.location.href = `${query.redirect}&sig=${query.sig}`;
              } else {
                window.location.href = `${query.redirect}?sig=${query.sig}`;
              }
            } else if (query.redirect) {
              window.location.href = `login?redirect=${query.redirect}`;
            } else if (
              locationState !== null &&
              locationState !== undefined &&
              _.findKey(locationState, 'from')
            ) {
              history.push(locationState.from);
            } else {
              history.push({
                pathname: '/',
              });
            }
          }
        );
      }
    });
  };

  render() {
    const prefixCls = 'ecmc-login';
    const { getFieldDecorator } = this.props.form!;
    const { isRender } = this.state;

    if (!isRender) return null;
    return (
      <div className={prefixCls}>
        <div className={`${prefixCls}-main-width`}>
          <div className={`${prefixCls}-main-height`}>
            <div className={`${prefixCls}-main`}>
              <Row>
                <Col span={12}>
                  <img width={380} src={require('./assets/login-left.png')} />
                </Col>
                <Col span={12}>
                  <div className={`${prefixCls}-main-right`}>
                    <Form onSubmit={this.handleSubmit}>
                      <FormItem>
                        {getFieldDecorator('username', {
                          rules: [{ required: true,  message:"必填项！" }],
                        })(
                          <Input
                            prefix={
                              <Icon
                                type="user"
                                style={{ color: 'rgba(0,0,0,.25)' }}
                              />
                            }
                            ref={(input) => (this.textInput = input)}
                            placeholder={this.props.intl.formatMessage({
                              id: 'user.username',
                            })}
                          />
                        )}
                      </FormItem>
                      <FormItem>
                        {getFieldDecorator('password', {
                          rules: [{ required: true,  message:"必填项！" }],
                        })(
                          <Input
                            prefix={
                              <Icon
                                type="lock"
                                style={{ color: 'rgba(0,0,0,.25)' }}
                              />
                            }
                            type="password"
                            placeholder={this.props.intl.formatMessage({
                              id: 'user.password',
                            })}
                          />
                        )}
                      </FormItem>
                      <FormItem style={{ marginBottom: 0 }}>
                        {getFieldDecorator('is_ldap', {
                          valuePropName: 'checked',
                          initialValue: this.state.ldapUsed,
                        })(
                          <Checkbox>
                            <FormattedMessage id="login.ldap" />
                          </Checkbox>
                        )}
                        <Button
                          type="primary"
                          htmlType="submit"
                          className={`${prefixCls}-submitBtn`}
                        >
                          <FormattedMessage id="form.login" />
                        </Button>
                      </FormItem>
                    </Form>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default injectIntl(Form.create()(Login));
