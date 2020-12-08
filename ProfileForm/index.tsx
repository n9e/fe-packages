import React, { Component } from 'react';
import {
  Form, Input, Switch, Icon
} from 'antd';
import { FormattedMessage } from 'react-intl';
import { FormProps } from 'antd/lib/form';
import _ from 'lodash';
import UserSelect from '../UserSelect';

interface Props {
  type: 'post' | 'register' | 'put',
  isrootVsible: boolean,
  initialValue: any,
}

const FormItem = Form.Item;

class ProfileForm extends Component<Props & FormProps> {
  static defaultProps: Props = {
    type: 'post',
    isrootVsible: false,
    initialValue: {},
  };

  state = {
    tenantData: [] as any[],
    feConf: {},
  };

  componentDidMount() {
    fetch('/static/feConfig.json').then((res) => {
      return res.json();
    }).then((res) => {
      this.setState({
        feConf: res,
      });
    });
  }

  validateFields() {
    return this.props.form!.validateFields;
  }

  validatePassword = (_rule: string, value: string, callback: any) => {
    const passwordReg = /^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*,\.])[0-9a-zA-Z!@#$%^&*,\\.].*$/

    if (value) {
      if (!passwordReg.test(value)) {
        callback('密码必须同时包含大写字母、小写字母、数字和符号且长度为8~20个字符！');
      }
      if (value.length < 8 || value.length > 20) {
        callback('密码长度8~20位')
      }
    }
    callback();
  }

  render() {
    const { type, isrootVsible, initialValue } = this.props;
    const { getFieldDecorator } = this.props.form!;
    const { feConf } = this.state;
    const usernameRules = _.get(feConf, 'rdb.username.rules', []);
    const usernamePlaceholder = _.get(feConf, 'rdb.username.placeholder', '');

    return (
      <Form layout="vertical">
        <FormItem label={<FormattedMessage id="user.username" />} required>
          {getFieldDecorator('username', {
            initialValue: initialValue.username,
            rules: _.concat([{ required: true, message: '用户名必填' }], usernameRules),
          })(
            <Input
              autoComplete="off"
              disabled={type === 'put'}
              placeholder={usernamePlaceholder} />,
          )}
        </FormItem>
        {
          type === 'post' || type === 'register'
            ? (
              <>
                <FormItem label={<FormattedMessage id="user.password" />} required>
                    {getFieldDecorator('password', {
                      rules: [{ required: true }, { validator: this.validatePassword }],
                    })(
                      <Input
                        type="password"
                        autoComplete="new-password"
                        placeholder="长度8~20字符，必须同时包含大写字母、小写字母、数字和符号！" />,
                    )}
                  </FormItem>
              </>
            ) : null
        }
        <FormItem label={<FormattedMessage id="user.dispname" />} required>
          {getFieldDecorator('dispname', {
            initialValue: initialValue.dispname,
            rules: [{ required: true }],
          })(
            <Input />,
          )}
        </FormItem>
        <FormItem label={<FormattedMessage id="user.phone" />}>
          {getFieldDecorator('phone', {
            initialValue: initialValue.phone,
          })(
            <Input style={{ width: '100%' }} />,
          )}
        </FormItem>
        <FormItem label={<FormattedMessage id="user.email" />}>
          {getFieldDecorator('email', {
            initialValue: initialValue.email,
          })(
            <Input />,
          )}
        </FormItem>
        <FormItem label="IM">
          {getFieldDecorator('im', {
            initialValue: initialValue.im,
          })(
            <Input />,
          )}
        </FormItem>
        <FormItem label="组织">
          {getFieldDecorator('organization', {
            initialValue: initialValue.organization,
          })(
            <Input />,
          )}
        </FormItem>
        {
          type !== 'register' ?
            <>
              <FormItem label={<FormattedMessage id="user.leader" />}>
                {getFieldDecorator('leader_id', {
                  initialValue: initialValue.leader_id || undefined,
                })(
                  <UserSelect />,
                )}
              </FormItem>
            </> : null
        }
        {
          isrootVsible
            ? (
              <FormItem label={<FormattedMessage id="user.isroot" />}>
                {getFieldDecorator('is_root', {
                  valuePropName: 'checked',
                  initialValue: initialValue.is_root === 1,
                })(
                  <Switch
                    checkedChildren={<Icon type="check" />}
                    unCheckedChildren={<Icon type="close" />}
                  />,
                )}
              </FormItem>
            ) : null
        }
      </Form>
    );
  }
}

export default Form.create()(ProfileForm);
