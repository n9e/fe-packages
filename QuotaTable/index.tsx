import React, { useState, useEffect }  from 'react';
import { Table } from 'antd';
import { TableProps } from 'antd/lib/table';
import { BasicTable, useAsyncRetry } from 'antd-advanced';
import _ from 'lodash';
import request from '@pkgs/request';
import api from '@pkgs/api';
import './style.less'
// import { Response } from '../interface';

interface IQuotaTable {
  type?: 'create' | 'upgrade' | 'downgrade';
  product: string;
  parent?: string;
  value?: any;
  onChange?: (newValue: any) => void;
  antProps?: TableProps<{}>;
  searchPlaceholder?: string;
  searchPos?: 'full' | 'right' | string;
  filterType?: 'line' | 'half' | 'none' | string;
  reloadBtnPos?: 'left' | 'right' | string;
  reloadBtnType?: 'icon' | 'btn' | string;
  showSearch?: boolean;
  showReloadBtn?: boolean;
  hideContentBorder?: boolean
}

interface ParamsList {
  specId : number,
  specName: string,
  specIdent: string,
  specValue: number | string,
}

interface QuotaList {
  id : number,
  params: Array<ParamsList>
}

interface ColumnsList {
  title : string,
  dataIndex: string
}
const defaultColumns = [{
  title: '规格名称',
  dataIndex: 'name',
}]
const QuotaTable = (props: IQuotaTable) => {
  const type = props.type || 'create';
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [columns, setColumns] = useState<ColumnsList[]>([]);

  const tableState = useAsyncRetry(async () => {

    const res = await request(`${api.specgroups}?action=${type}&product=${props.product}&parent=${props.parent || ''}`)
    if (res[0]) {
      const newColumns = [] as ColumnsList[]
      newColumns.push(...defaultColumns)
      res[0].params&&res[0].params.map((item: ParamsList) => {
        const itemColums =  {
          title: item.specName,
          dataIndex: item.specIdent
        }
        newColumns.push(itemColums)
      })
      setColumns(newColumns)
    }
    return res;
  })

  const onSelectChange = (newKeys: string[]) => {
    setSelectedRowKeys(newKeys);
    const selectQuotaId = newKeys[0] ? newKeys[0] : 0;

    const selectQuotaInfo = tableState.value.find((pkgItem: QuotaList) => {
      return pkgItem.id === selectQuotaId;
    })
    if (props.onChange) {
      props.onChange(selectQuotaInfo)
    }
  };

  const renderColumns = () => columns.map((item: any) => {
    if (item.dataIndex !== 'name') {
      return ({
        ...item,
        render: (text:string, record: QuotaList, index: number) => {
          const params = record.params ? record.params.filter((paramsItem: ParamsList) => paramsItem.specIdent === item.dataIndex) : []
          if (params[0]) {
            return (
              <span>
                {params[0].specValue}
              </span>
            )
          }
          return ''
        }
      })
    }
    return item;
  });

  const rowSelection = {
    type: 'radio',
    selectedRowKeys,
    onChange: onSelectChange,
  };

  return (
    <div className="quota-basic-table">
      <BasicTable
        antProps={{
          rowKey: "id",
          ...props.antProps
        }}
        rowSelection={rowSelection as any}
        searchPos={props.searchPos || "right"}
        searchPlaceholder={props.searchPlaceholder || "模糊匹配，根据规格名称搜索"}
        reloadBtnPos={props.reloadBtnPos || "left"}
        reloadBtnType={props.reloadBtnType || "btn"}
        filterType={props.filterType || "none"}
        showSearch={props.showSearch || false}
        showReloadBtn={props.showReloadBtn || false}
        hideContentBorder={props.hideContentBorder || false}
        columns={renderColumns()}
        loading={tableState.loading}
        onReload={tableState.retry}
        dataSource={tableState.value}
      />
    </div>
  );
}

export default QuotaTable;
