/* eslint-disable react/no-unused-prop-types */
/**
 * ## 多选组件
 * 面向待选择的数据长度过大提供分页功能，以及搜索和全选/非全选功能。
 * ### Props:
 * | 属性 | 说明 | 类型 | 默认值 |
 * | data            | 选择原数据      | Array | [] |
 * | selected        | 已选项          | Array | [] |
 * | defaultPageSize | 默认每页显示数量 | Number | 5 |
 * | onChange        | 选择更改回调    | Function(selected, currentItemVa, currentItemChecked) | noop |
 * | onRemoveAll     | 删除所有选择    | Function | noop |
 * | onCurrentPageSelectAll | 全选当页选项    | Function(currentPageSelected) | noop |
 * | onSelectAll | 全选当页选项    | Function(currentPageSelected) | noop |
 * | onSearch        | 搜索回调       | Function(searchVal, filteredData) | noop |
 * ### Methods:
 * - getSelected 获取已选项
 * - setSelected 设定已选项
 */

import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import { Row, Col, Input, Button, Pagination, Checkbox, Popover, Tag, Table, message } from 'antd';
import _ from 'lodash';
import { FormattedMessage } from 'react-intl';
import DynamicColumns from '../DynamicColumns';
import { NsTreeContext } from '../Layout/Provider';
import './style.less';

const TextArea = Input.TextArea ? Input.TextArea : Input;

class Multipicker extends Component {
  constructor(props) {
    super(props);
    const cached = window.localStorage.getItem('dynamic-columns-monitor-hosts');
    let defaultKeys = ['name', 'sn'];
    if (cached) {
      defaultKeys = JSON.parse(cached);
    }
    this.state = {
      current: 1,
      width: 400,
      searchVal: '',
      manualVisible: false,
      manualVal: '',
      selected: [],
      dynamicColumnsValue: defaultKeys,
    };
  }

  componentWillMount() {
    this.initialState(this.props);
  }

  componentDidMount() {
    const $multipicker = this.multipicker;
    const width = $multipicker.clientWidth;

    // eslint-disable-next-line react/no-did-mount-set-state
    this.setState({ width });
  }

  componentWillReceiveProps(nextProps) {
    this.initialState(nextProps);
  }

  getSelected() {
    return _.clone(this.state.selected);
  }

  setSelected(selected) {
    this.setState({ selected });
  }

  // eslint-disable-next-line react/sort-comp
  initialState(props) {
    const { data, defaultPageSize, selected } = props;

    this.setState({
      data: _.uniq(data),
      defaultPageSize,
      selected,
    });
  }

  handleChangeCheckbox = (e) => {
    const { selected } = this.state;
    const { checked, value } = e.target;
    const newSelected = _.clone(selected);

    if (checked) {
      newSelected.push(value);
    } else {
      _.remove(newSelected, n => n === value);
    }
    this.setState({
      selected: newSelected,
    }, () => {
      this.props.onChange.call(this, newSelected, value, checked);
    });
  }

  removeAll = () => {
    this.setState({ selected: [] }, () => {
      this.props.onRemoveAll.call(this);
      this.props.onChange.call(this, []);
    });
  }

  handleManualEntry = () => {
    const { selected, manualVal } = this.state;
    const arrVal = manualVal ? _.split(manualVal, '\n') : [];
    const newSelected = _.uniq(_.concat([], arrVal, selected));

    _.remove(newSelected, o => o === '');

    this.setState({
      selected: newSelected,
      manualVisible: false,
      manualVal: '',
    }, () => {
      this.props.onChange.call(this, newSelected);
    });
  }

  currentPageSelectAll = () => {
    const { type } = this.props;
    const { selected, current, defaultPageSize } = this.state;
    const data = this.filterData();
    let selectedList = _.filter(data, (item, i) => {
      return i >= ((current - 1) * defaultPageSize) && i < (current * defaultPageSize);
    });
    if (type === 'host') {
      selectedList = _.map(selectedList, 'ident');
    }
    let newSelected = _.clone(selected);

    newSelected = _.uniq(newSelected.concat(selectedList));
    this.setState({ selected: newSelected }, () => {
      this.props.onCurrentPageSelectAll.call(this, selectedList);
      this.props.onChange.call(this, newSelected);
    });
  }

  selectAll = () => {
    const { type } = this.props;
    const { selected, data, searchVal } = this.state;
    let selectedList = _.cloneDeep(data);

    if (data.length > 500) {
      selectedList = selectedList.splice(0, 500);
      message.warning('Can only select a maximum of 500');
    }
    if (searchVal) {
      selectedList = _.uniq(selected.concat(this.filterData()));
    }
    if (type === 'host') {
      selectedList = _.map(selectedList, 'ident');
    }
    this.setState({
      selected: selectedList,
    }, () => {
      this.props.onSelectAll.call(this, selectedList);
      this.props.onChange.call(this, selectedList);
    });
  }

  search = (e) => {
    const searchVal = e.target.value;

    this.setState({
      searchVal,
      current: 1,
    }, () => {
      this.props.onSearch.call(this, searchVal, this.filterData());
    });
  }

  paginationChange = (current) => {
    this.setState({ current });
  }

  createSelectedList = () => {
    const treeData = _.get(this.context, 'data.treeData');
    const { type } = this.props;
    const { selected } = this.state;
    // const keys = ['name', 'sn'];
    const filtered = _.filter(selected, (item, i) => i < this.props.selectedMaxDisplayNum);
    const onClose = (e, value) => {
      const newSelected = _.filter(selected, n => n !== value);
      this.setState({ selected: newSelected }, () => {
        this.props.onChange.call(this, newSelected, value, false);
      });
    };
    const lis = _.map(filtered, (item, i) => {
      let itemstr = item;
      if (type === 'host') {
        // itemstr = '';
        // const result = _.find(data, { [habitsId]: item });
        // if (result) {
        //   const realKeys = _.filter(keys, (keyItem) => {
        //     return _.includes(this.state.dynamicColumnsValue, keyItem);
        //   });
        //   const values = _.map(realKeys, (columnKey) => {
        //     return result[columnKey];
        //   });
        //   itemstr = _.join(values, ' ');
        // }
      }
      if (type === 'nids') {
        const result = _.find(treeData, { id: _.toNumber(item) });
        itemstr = result ? _.get(result, 'path') : item;
      }

      return (
        <Tag
          key={i}
          title={itemstr}
          closable
          visible
          onClick={() => {
            this.props.onSelectedClick(item);
          }}
          onClose={(e) => { onClose(e, item); }}
        >
          {itemstr}
        </Tag>
      );
    });

    if (filtered.length < selected.length) {
      lis.push(<span key="more">...</span>);
    }

    return lis;
  }

  createOptionList = (data) => {
    const treeData = _.get(this.context, 'data.treeData');
    const { type } = this.props;
    const { selected, current, defaultPageSize, width, dynamicColumnsValue } = this.state;
    const optionList = [];

    if (type === 'host') {
      const keys = ['name', 'ident'];
      let columns = _.map(keys, (item) => {
        return {
          title: item,
          dataIndex: item,
          // width: item === 'ip' ? 110 : 'auto',
        };
      });
      columns = _.filter(columns, (column) => {
        let visible = true;
        if (column.dataIndex) {
          visible = dynamicColumnsValue.indexOf(column.dataIndex) > -1;
        }
        return visible;
      });
      return (
        <Table
          size="small"
          rowKey="ident"
          scroll={{ y: 175 }}
          dataSource={data}
          columns={columns}
          rowSelection={{
            selectedRowKeys: selected,
            onChange: (val) => {
              this.setState({ selected: val }, () => {
                this.props.onChange.call(this, val);
              });
            },
          }}
          pagination={{
            size: 'small',
            current,
            defaultPageSize,
            total: data.length,
            onChange: this.paginationChange,
          }}
        />
      );
    }

    _.each(data, (item, i) => {
      if (i >= ((current - 1) * defaultPageSize) && i < (current * defaultPageSize)) {
        optionList.push(
          <li className="multipicker-option" key={i}>
            <Checkbox
              value={item}
              onChange={this.handleChangeCheckbox}
              checked={selected.indexOf(item) > -1}
              >
              <span title={item} className="multipicker-tagItem" style={{
                maxWidth: width - 70,
              }}>
                {
                  type !== 'nids' ? item : _.get(_.find(treeData, { id: _.toNumber(item) }), 'path')
                }
              </span>
            </Checkbox>
          </li>,
        );
      }
    });

    return (
      <>
        <ul className="multipicker-option-list">
          {optionList}
        </ul>
        <div style={{ marginTop: 10, textAlign: 'center' }}>
          <Pagination
            size="small"
            current={current}
            defaultPageSize={defaultPageSize}
            total={data.length}
            onChange={this.paginationChange}
          />
        </div>
      </>
    );
  }

  filterData() {
    const { data, searchVal } = this.state;

    try {
      const reg = new RegExp(searchVal, 'i');
      return _.filter(data, (item) => {
        if (_.isString(item)) {
          return reg.test(item);
        }
        if (_.isPlainObject(item)) {
          return _.some(item, (val) => {
            return reg.test(val);
          });
        }
        return true;
      });
    } catch (e) {
      return [];
    }
  }

  render() {
    const { type, manualEntry } = this.props;
    const { selected = [], dynamicColumnsValue } = this.state;
    const keys = ['name', 'ident'];
    const dynamicColumnsOptions = _.map(keys, (item) => {
      return {
        label: item,
        value: item,
      };
    });
    const data = this.filterData();

    return (
      <div
        className="multipicker-panel"
        ref={(ref) => { this.multipicker = ref; }}
        style={{ width: this.props.width }}
      >
        <div className="multipicker-selected-list-box">
          <Row>
            <Col span={14}>
              <strong><FormattedMessage id="select.selected" />({selected.length})：</strong>
              <a
                className="remove-all"
                onClick={this.removeAll}
              >
                <FormattedMessage id="select.selected.clear" />
              </a>
              {
                manualEntry &&
                <Popover
                  placement="topLeft"
                  trigger="click"
                  visible={this.state.manualVisible}
                  onVisibleChange={(visible) => {
                    this.setState({ manualVisible: visible });
                  }}
                  content={
                    <div>
                      <TextArea
                        type="textarea"
                        autosize={{ minRows: 2, maxRows: 6 }}
                        style={{ width: 230 }}
                        placeholder="Multiple values ​​are split by line breaks"
                        value={this.state.manualVal}
                        onChange={(e) => {
                          this.setState({ manualVal: e.target.value });
                        }}
                      />
                      <div style={{ marginTop: 5 }}>
                        <Button size="small" onClick={this.handleManualEntry}>Ok</Button>
                      </div>
                    </div>
                  }
                >
                  <a
                    style={{ paddingLeft: 10 }}
                    onClick={() => {
                      // eslint-disable-next-line react/no-access-state-in-setstate
                      this.setState({ manualVisible: !this.state.manualVisible });
                    }}
                  >
                    <FormattedMessage id="select.manual.input" />
                  </a>
                </Popover>
              }
            </Col>
          </Row>
          <ul className="multipicker-selected-list">{this.createSelectedList()}</ul>
        </div>
        <div className="multipicker-option-list-box">
          <Row>
            <Col span={16}>
              <strong><FormattedMessage id="select.total" />({data.length})：</strong>
              <a
                className="select-all-currentPage"
                onClick={this.currentPageSelectAll}
                style={{ paddingRight: 10 }}
              >
                <FormattedMessage id="select.current.page" />
              </a>
              <a className="select-all" onClick={this.selectAll}><FormattedMessage id="select.all" /></a>
              {
                type === 'host' ?
                  <span style={{ paddingLeft: 10 }}>
                    <DynamicColumns
                      uid="monitor-hosts"
                      targetType="string"
                      options={dynamicColumnsOptions}
                      value={dynamicColumnsValue}
                      onChange={(_keys) => {
                        this.setState({
                          dynamicColumnsValue: _keys,
                        });
                      }}
                    />
                  </span> : null
              }
            </Col>
            <Col span={8}>
              <div className="multipicker-search">
                <Input
                  size="small"
                  type="text"
                  className="keyword"
                  placeholder="support regular"
                  onChange={this.search} />
              </div>
            </Col>
          </Row>
          {this.createOptionList(data)}
        </div>
      </div>
    );
  }
}

// Multipicker.propTypes = {
//   width: PropTypes.oneOfType([
//     PropTypes.string,
//     PropTypes.number,
//   ]),
//   data: PropTypes.array,
//   selected: PropTypes.array,
//   selectedMaxDisplayNum: PropTypes.number,
//   manualEntry: PropTypes.bool,
//   defaultPageSize: PropTypes.number,
//   onChange: PropTypes.func,
//   onRemoveAll: PropTypes.func,
//   onCurrentPageSelectAll: PropTypes.func,
//   onSelectAll: PropTypes.func,
//   onSearch: PropTypes.func,
//   onSelectedClick: PropTypes.func,
// };

Multipicker.contextType = NsTreeContext;

Multipicker.defaultProps = {
  width: 400,
  data: [],
  selected: [],
  selectedMaxDisplayNum: 100,
  manualEntry: false,
  defaultPageSize: 5,
  onChange: () => {},
  onRemoveAll: () => {},
  onCurrentPageSelectAll: () => {},
  onSelectAll: () => {},
  onSearch: () => {},
  onSelectedClick: () => {},
};

export default Multipicker;
