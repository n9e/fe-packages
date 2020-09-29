import React, { Component } from 'react';
import { Table, Button, Popconfirm, message } from 'antd';
import { ColumnProps } from 'antd/lib/table';
import { FormattedMessage, injectIntl, WrappedComponentProps } from 'react-intl';
import request from '../../request';
import api from '../../api';

interface DataItem {
  token: string,
  user_id: number,
}

interface State {
  loading: boolean,
  data: DataItem[],
}

class Token extends Component<WrappedComponentProps, State> {
  state = {
    loading: false,
    data: [],
  };

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async () => {
    this.setState({ loading: true });
    request(api.selftToken).then((data) => {
      this.setState({ data: data || [] });
    }).finally(() => {
      this.setState({ loading: false });
    });
  }

  handleResetToken = (token: string) => {
    request(api.selftToken, {
      method: 'PUT',
      body: JSON.stringify({ token }),
    }).then(() => {
      message.success(this.props.intl.formatMessage({ id: 'token.reset.success' }));
      this.fetchData();
    });
  }

  handleCreateToken = () => {
    request(api.selftToken, {
      method: 'POST',
    }).then(() => {
      message.success(this.props.intl.formatMessage({ id: 'msg.create.success' }));
      this.fetchData();
    });
  }

  render() {
    const { loading, data } = this.state;
    return (
      <Table
        rowKey="token"
        pagination={false}
        loading={loading}
        dataSource={data}
        columns={[
          {
            title: 'Token',
            dataIndex: 'token',
          }, {
            title: <FormattedMessage id="table.operations" />,
            render: (_text, record) => {
              return (
                <Popconfirm
                  title="重置将导致所有使用该 token 的接口失效，确定要重置吗？"
                  onConfirm={() => { this.handleResetToken(record.token); }}
                >
                  <a><FormattedMessage id="token.reset" /></a>
                </Popconfirm>
              );
            },
          },
        ] as ColumnProps<DataItem>[]}
        footer={() => {
          return (
            <div>
              <Button
                disabled={data.length >= 2}
                className="mr10"
                onClick={this.handleCreateToken}
              >
                <FormattedMessage id="table.create" />
              </Button>
              {
                data.length >= 2 ? '最多只能创建两个 token' : null
              }
            </div>
          );
        }}
      />
    );
  }
}

export default injectIntl(Token);
