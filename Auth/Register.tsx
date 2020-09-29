import React, { Component } from 'react';
import { Card, Button } from 'antd';
import { RouteComponentProps } from 'react-router-dom';
import queryString from 'query-string';
import ProfileForm from '../ProfileForm';
import { FormattedMessage } from 'react-intl';
import request from '../request';
import api from '../api';
import './style.less';

class Register extends Component<RouteComponentProps> {
  profileForm: any;

  handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { location, history } = this.props;
    const query = queryString.parse(location.search);
    this.profileForm.validateFields(async (err: any, values: any) => {
      if (!err) {
        try {
          await request(`${api.users}/invite`, {
            method: 'POST',
            body: JSON.stringify({
              ...values,
              token: query.token,
            }),
          });
          history.push({
            pathname: '/',
          });
        } catch (e) { console.log(e); }
      }
    });
  }

  render() {
    const prefixCls = 'ecmc-register';

    return (
      <div className={prefixCls}>
        <div className={`${prefixCls}-main`}>
          <Card>
            <div className={`${prefixCls}-title`}>
              <FormattedMessage id="register.account" />
            </div>
            <ProfileForm type="register" ref={(ref: any) => { this.profileForm = ref; }} />
            <Button
              type="primary"
              className={`${prefixCls}-submitBtn`}
              onClick={this.handleSubmit}
            >
              <FormattedMessage id="register" />
            </Button>
          </Card>
        </div>
      </div>
    );
  }
}

export default Register;
