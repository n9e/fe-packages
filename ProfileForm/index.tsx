import React, { Component } from 'react';
import {
  Form, Input, Switch, Icon, Radio, DatePicker, Row, Col
} from 'antd';
import { FormattedMessage } from 'react-intl';
import { FormProps } from 'antd/lib/form';
import _ from 'lodash';
import UserSelect from '../UserSelect';
import moment from 'moment';

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
    userType: 0,
    startTime: '', // 开始时间
    endTime: '', // 结束时间
  };

  validateFields() {
    return this.props.form!.validateFields;
  }

  // 开始时间选择器(监控记录日期变换)
  handleStartDateChange = (value: any, dateString: string) => {
    this.setState({
      startTime: dateString,
    });
  };

  // 结束时间选择器(监控记录日期变换)
  handleEndDateChange = (value: any, dateString: string) => {
    this.setState({
      endTime: dateString,
    });
  };

  // 结束时间可选范围
  handleEndDisabledDate = (current: any) => {
    const { startTime } = this.state;
    if (startTime !== '') {
      // 核心逻辑: 结束日期不能多余开始日期后90天，且不能早于开始日期
      return current > moment(startTime).add(90, 'day') || current < moment(startTime);
    } else {
      return null;
    }
  }

  // 开始时间可选范围
  handleStartDisabledDate = (current: any) => {
    const { endTime } = this.state;
    if (endTime !== '') {
      // 核心逻辑: 开始日期不能晚于结束日期，且不能早于结束日期前90天
      return current < moment(endTime).subtract(90, 'day') || current > moment(endTime);
    } else {
      return null;
    }
  }


  render() {
    const { type, isrootVsible, initialValue } = this.props;
    const { getFieldDecorator } = this.props.form!;

    return (
      <Form layout="vertical">
        <FormItem label='账号类型' required>
          {getFieldDecorator('type', {
            initialValue: initialValue.type,
            rules: [{ required: true }],
          })(
            <Radio.Group defaultValue={0} disabled={type === 'put'} onChange={(e) => this.setState({ userType: e.target.value })}>
              <Radio value={0}>长期账号</Radio>
              <Radio value={1}>临时账号</Radio>
            </Radio.Group>,
          )}
        </FormItem>
        {
          this.state.userType === 1 ?
            <Row>
              <Form.Item label="账号生效时间" style={{height: 50}}>
                <Col span={10}>
                  <Form.Item style={{ marginTop: '3px' }}>
                    {getFieldDecorator('active_begin', {
                      initialValue: moment(initialValue.active_begin),
                      rules: [{ required: true }],
                    })(
                      <DatePicker
                        onChange={this.handleStartDateChange}
                        disabledDate={this.handleStartDisabledDate}
                        placeholder="开始日期"
                      />)
                    }
                  </Form.Item>
                </Col>
                <Col span={1}>
                  <span style={{ display: 'inline-block', textAlign: 'center', paddingTop: 10 }}>-</span>
                </Col>
                <Col span={10}>
                  <Form.Item style={{ marginTop: '3px' }}>
                    {getFieldDecorator('active_end', {
                      initialValue: moment(initialValue.active_end),
                      rules: [{ required: true }],
                    })(
                      <DatePicker
                        onChange={this.handleEndDateChange}
                        disabledDate={this.handleEndDisabledDate}
                        placeholder="结束日期"
                      />)
                    }
                  </Form.Item>
                </Col>
              </Form.Item>
            </Row>
            : null
        }
        <FormItem label={<FormattedMessage id="user.username" />} required>
          {getFieldDecorator('username', {
            initialValue: initialValue.username,
            rules: [{ required: true }],
          })(
            <Input
              autoComplete="off"
              disabled={type === 'put'}
              placeholder="请输入用户名" />,
          )}
        </FormItem>
        {
          type === 'post' || type === 'register'
            ? (
              <>
                <FormItem label={<FormattedMessage id="user.password" />} required>
                  {getFieldDecorator('password', {
                    rules: [{ required: true }],
                  })(
                    <Input
                      type="password"
                      autoComplete="new-password"
                      placeholder="请输入密码" />,
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
