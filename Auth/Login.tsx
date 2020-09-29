import React, { Component } from 'react';
import {
  Form, Input, Icon, Button, Checkbox, Row, Col,
} from 'antd';
import { RouteComponentProps } from 'react-router-dom';
import queryString from 'query-string';
import { FormProps } from 'antd/lib/form';
import _ from 'lodash';
import { FormattedMessage, injectIntl, WrappedComponentProps } from 'react-intl';
import auth from './auth';
import * as loginBackgroundAnimation from './loginBackgroundAnimation';
import request from '../request';
import api from '../api';
import './style.less';

const FormItem = Form.Item;

class Login extends Component<RouteComponentProps & FormProps & WrappedComponentProps> {
  state = {
    ldapUsed: false,
  };
  componentDidMount() {
    loginBackgroundAnimation.init();
    loginBackgroundAnimation.animate();
    this.fetchData();
  }

  componentWillUnmount() {
    const ele = document.getElementById('login-bg-canvas');
    if (ele && ele.parentNode) {
      ele.parentNode.removeChild(ele);
    }
  }

  fetchData() {
    request(`${api.ldap}/used`).then((res) => {
      this.setState({ ldapUsed: res });
    });
  }

  handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { history, location } = this.props;
    const { search } = location;

    this.props.form!.validateFields((err, values) => {
      if (!err) {
        auth.authenticate({
          ...values,
          is_ldap: values.is_ldap ? 1 : 0,
        }, () => {
          const query = queryString.parse(search);
          const locationState = location.state as any;
          if (query.callback && query.sig) {
            if (query.callback.indexOf('?') > -1) {
              window.location.href = `${query.callback}&sig=${query.sig}`;
            } else {
              window.location.href = `${query.callback}?sig=${query.sig}`;
            }
          } else if (locationState !== null && locationState !== undefined && _.findKey(locationState, 'from')) {
            history.push(locationState.from);
          } else {
            history.push({
              pathname: '/',
            });
          }
        });
      }
    });
  }

  render() {
    const prefixCls = 'ecmc-login';
    const { getFieldDecorator } = this.props.form!;

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
                    <div className={`${prefixCls}-title`}>
                      <img width="114" src={require('./assets/logo.png')} />
                    </div>
                    <Form onSubmit={this.handleSubmit}>
                      <FormItem>
                        {getFieldDecorator('username', {
                          rules: [{ required: true, message: 'required' }],
                        })(
                          <Input prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder={this.props.intl.formatMessage({ id: 'user.username' })} />,
                        )}
                      </FormItem>
                      <FormItem>
                        {getFieldDecorator('password', {
                          rules: [{ required: true, message: 'required' }],
                        })(
                          <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder={this.props.intl.formatMessage({ id: 'user.password' })} />,
                        )}
                      </FormItem>
                      <FormItem style={{ marginBottom: 0 }}>
                        {getFieldDecorator('is_ldap', {
                          valuePropName: 'checked',
                          initialValue: this.state.ldapUsed,
                        })(
                          <Checkbox><FormattedMessage id="login.ldap" /></Checkbox>,
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
