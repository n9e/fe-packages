import React, { Component } from 'react';
import { Form, Input, Icon, Button, message } from 'antd';
import { FormComponentProps } from 'antd/es/form';
import { FormattedMessage, injectIntl, WrappedComponentProps } from 'react-intl';
import request from '../../request';
import api from '../../api';

const FormItem = Form.Item;

class index extends Component<FormComponentProps & WrappedComponentProps> {
  validateFields() {
    return this.props.form.validateFields;
  }

  handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    this.props.form.validateFields(async (err, values) => {
      if (!err) {
        try {
          await request(api.selftPassword, {
            method: 'PUT',
            body: JSON.stringify(values),
          });
          message.success(this.props.intl.formatMessage({ id: 'msg.modify.success' }));
        } catch (e) { console.log(e) }
      }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form layout="vertical" onSubmit={this.handleSubmit}>
        <FormItem label={<FormattedMessage id="password.old" />} required>
          {getFieldDecorator('oldpass', {
            rules: [{ required: true }],
          })(
            <Input
              prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
              type="password"
            />,
          )}
        </FormItem>
        <FormItem label={<FormattedMessage id="password.new" />} required>
          {getFieldDecorator('newpass', {
            rules: [{ required: true }],
          })(
            <Input
              prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
              type="password"
            />,
          )}
        </FormItem>
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
