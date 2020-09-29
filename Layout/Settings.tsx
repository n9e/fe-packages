import React, { Component } from 'react';
import { Modal, Tabs } from 'antd';
import _ from 'lodash';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import ModalControl, { ModalWrapProps } from '../ModalControl';
import Profile from './Self/Profile';
import Password from './Self/Password';
import Token from './Self/Token';

const { TabPane } = Tabs;
const WIDTH = 465;

interface Props {
}

class Settings extends Component<Props & ModalWrapProps & WrappedComponentProps> {
  static defaultProps = {
    visible: true,
    onOk: _.noop,
    onCancel: _.noop,
    destroy: _.noop,
  };

  render() {
    const { visible } = this.props;

    return (
      <Modal
        width={WIDTH}
        title={this.props.intl.formatMessage({ id: 'user.settings' })}
        visible={visible}
        footer={null}
        onCancel={() => {
          this.props.destroy();
        }}
        bodyStyle={{
          padding: '10px 24px 24px 24px',
        }}
      >
        <Tabs>
          <TabPane tab={this.props.intl.formatMessage({ id: 'user.settings.profile' })} key="baseSetting">
            <Profile />
          </TabPane>
          <TabPane tab={this.props.intl.formatMessage({ id: 'user.settings.password' })} key="resetPassword">
            <Password />
          </TabPane>
          <TabPane tab={this.props.intl.formatMessage({ id: 'user.settings.token' })} key="token">
            <Token />
          </TabPane>
        </Tabs>
      </Modal>
    );
  }
}

export default ModalControl(injectIntl(Settings) as any);
