import React, { Component } from 'react';
import { Form, Input, Button, message } from 'antd';
import { FormComponentProps } from 'antd/es/form';
import { FormattedMessage, injectIntl, WrappedComponentProps } from 'react-intl';
import request from '../../request';
import api from '../../api';

interface ProfileValues {
  dispname: string,
  phone: string,
  email: string,
  im: string,
}

interface State {
  values: ProfileValues,
}

const FormItem = Form.Item;

class Profile extends Component<FormComponentProps & WrappedComponentProps, State> {
  state = {
    values: {
      dispname: '',
      phone: '',
      email: '',
      im: '',
    },
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async () => {
    try {
      const dat = await request(api.selftProfile);
      this.setState({
        values: {
          dispname: dat.dispname,
          phone: dat.phone,
          email: dat.email,
          im: dat.im,
        },
      });
    } catch (e) { console.log(e) }
  }

  handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    this.props.form.validateFields(async (err, values) => {
      if (!err) {
        try {
          await request(api.selftProfile, {
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
    const { values } = this.state;
    return (
      <Form layout="vertical" onSubmit={this.handleSubmit}>
        <FormItem label={<FormattedMessage id="user.dispname" />} required>
          {getFieldDecorator('dispname', {
            initialValue: values.dispname,
            rules: [{ required: true, message:"必填项！" }],
          })(
            <Input />,
          )}
        </FormItem>
        <FormItem label={<FormattedMessage id="user.phone" />}>
          {getFieldDecorator('phone', {
            initialValue: values.phone,
          })(
            <Input style={{ width: '100%' }} />,
          )}
        </FormItem>
        <FormItem label={<FormattedMessage id="user.email" />}>
          {getFieldDecorator('email', {
            initialValue: values.email,
          })(
            <Input />,
          )}
        </FormItem>
        <FormItem label="IM">
          {getFieldDecorator('im', {
            initialValue: values.im,
          })(
            <Input />,
          )}
        </FormItem>
        <FormItem>
          <Button type="primary" htmlType="submit">
            <FormattedMessage id="form.submit" />
          </Button>
        </FormItem>
      </Form>
    )
  }
}

export default injectIntl(Form.create()(Profile));
