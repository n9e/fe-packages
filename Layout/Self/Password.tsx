import React, { Component } from 'react';
import { Form, Input, Icon, Button, message } from 'antd';
import { FormComponentProps } from 'antd/es/form';
import { FormattedMessage, injectIntl, WrappedComponentProps } from 'react-intl';
import auth from '../../Auth/auth';
import request from '../../request';
import api from '../../api';
import _ from 'lodash';

const FormItem = Form.Item;

class index extends Component<FormComponentProps & WrappedComponentProps> {
  constructor(props: any) {
    super(props);
    this.state = {
      username: '',
      errMessage: ''
    };
  }

  getUserName = () => {
    auth.checkAuthenticate().then(() => {
      const username = _.get(auth.getSelftProfile(), 'username');
      this.setState({ username: username });
    });
  }

  componentDidMount = () => {
    this.getUserName()
  }

  handleSubmit = (e: React.FormEvent) => {
    const { username } = this.state;
    e.preventDefault();
    this.props.form.validateFields(async (err, values) => {
      if (!err) {
        if (values.newpass !== values.passwordConfirm) {
          message.error('两次密码输入不一致!')
          return;
        }
        try {
          await request(api.selftPassword, {
            method: 'PUT',
            body: JSON.stringify({
              ...values,
              username: username
            }),
          }).then(() => auth.signout(() => window.location.href = '/'));
          message.success(this.props.intl.formatMessage({ id: 'msg.modify.success' }));
        } catch (catchErr) {
          this.setState({ errMessage: catchErr.toString() });
          console.log(catchErr);
        }
      }
    });
  }

  validateFields() {
    return this.props.form.validateFields;
  }

  // validatePassword = (rule: string, value: string, callback: any) => {
  //   const passwordReg = /^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*,\.])[0-9a-zA-Z!@#$%^&*,\\.].*$/

  //   if (value) {
  //     if (!passwordReg.test(value)) {
  //       callback('密码必须同时包含大写字母、小写字母、数字和符号且长度为8~20个字符！');
  //     }
  //     if (value.length < 8 || value.length > 20) {
  //       callback('密码长度8~20位')
  //     }
  //   }
  //   callback();
  // }

  render() {
    const { errMessage } = this.state;
    const { getFieldDecorator } = this.props.form;
    return (
      <Form layout="vertical" onSubmit={this.handleSubmit}>
        <FormItem label={<FormattedMessage id="password.old" />} required>
          {getFieldDecorator('oldpass', {
            rules: [{ required: true, message: '必填项！' }],
          })(
            <Input
              prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="请输入旧密码"
              type="password"
            />,
          )}
        </FormItem>
        <FormItem label={<FormattedMessage id="password.new" />} required>
          {getFieldDecorator('newpass', {
            rules: [{ required: true, message: '必填项！' }],
          })(
            <Input
              prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="请输入新密码"
              type="password"
            />,
          )}
        </FormItem>
        <FormItem label="确认输入新密码">
          {getFieldDecorator("passwordConfirm", {
            rules: [{ required: true, message: errMessage ? ' ' : '必填项！' }],
          })(<Input
            prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
            placeholder="请再次确认输入密码"
            type="password"
          />)}
        </FormItem>
        {
          errMessage ? <div style={{ color: 'red', marginTop: '-15px' }}>
            <Icon type="close-circle" />{errMessage?.replace('Error: ', '')}
          </div> : null
        }
        <FormItem>
          <Button type="primary" htmlType="submit">
            <FormattedMessage id="form.submit" />
          </Button>
        </FormItem>
      </Form>
    );
  }
}

export default injectIntl(Form.create()(index));
