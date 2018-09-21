import React from 'react';
import { Table, Button, Input, Divider, message, Select, Modal, Switch } from 'antd';
import service from './interface.service';

class RequestParams extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      record: null,
      dataSource: [],
      isEdit: false,
      id: 1,
      expandedRowKeys: [],
      loading: false,
      columns: [
        {
          title: '字段',
          align: 'left',
          dataIndex: 'keyCode',
          width: 170,
          render: (value, record, index) => {
            return record.status == 'edit' || record.status == 'new' ? (
              <Input
                style={{ width: 128 - (record.level - 1) * 14 }}
                onChange={e => this.change('keyCode', e.target.value, record)}
                value={value}
              />
            ) : (
              <span>{value}</span>
            );
          },
        },
        {
          title: '参数位置',
          dataIndex: 'position',
          width: 140,
          render: (value, record, index) => {
            return record.status == 'edit' || record.status == 'new' ? (
              <Select
                style={{ width: '100%' }}
                onChange={e => this.change('position', e, record)}
                value={value}
              >
                <Select.Option value="body">body</Select.Option>
                <Select.Option value="cookie">cookie</Select.Option>
                <Select.Option value="formData">formData</Select.Option>
                <Select.Option value="header">header</Select.Option>
                <Select.Option value="path">path</Select.Option>
                <Select.Option value="query">query</Select.Option>
              </Select>
            ) : (
              <span>{value}</span>
            );
          },
        },
        {
          title: '类型',
          dataIndex: 'reqType',
          width: 120,
          render: (value, record, index) => {
            return record.status == 'edit' || record.status == 'new' ? (
              <Select
                style={{ width: '100%' }}
                onChange={e => this.change('reqType', e, record)}
                value={value}
              >
                <Select.Option value="string">string</Select.Option>
                <Select.Option value="array">array</Select.Option>
                <Select.Option value="object">object</Select.Option>
                <Select.Option value="int">int</Select.Option>
                <Select.Option value="long">long</Select.Option>
                <Select.Option value="float">float</Select.Option>
                <Select.Option value="double">double</Select.Option>
                <Select.Option value="decimal">decimal</Select.Option>
              </Select>
            ) : (
              <span>{value}</span>
            );
          },
        },
        {
          title: '名称',
          width: 160,
          dataIndex: 'name',
          render: (value, record, index) => {
            return record.status == 'edit' || record.status == 'new' ? (
              <Input
                style={{ width: '100%' }}
                onChange={e => this.change('name', e.target.value, record)}
                value={value}
              />
            ) : (
              <span>{value}</span>
            );
          },
        },
        {
          title: '默认值',
          width: 140,
          dataIndex: 'defaultValue',
          render: (value, record, index) => {
            return record.status == 'edit' || record.status == 'new' ? (
              <Input
                style={{ width: '100%' }}
                onChange={e => this.change('defaultValue', e.target.value, record)}
                value={value}
              />
            ) : (
              <span>{value}</span>
            );
          },
        },
        {
          title: '是否必填',
          width: 120,
          dataIndex: 'requiredFlag',
          render: (value, record, index) => {
            return record.status == 'edit' || record.status == 'new' ? (
              <Switch
                onChange={value => this.change('requiredFlag', value, record)}
                checked={value}
              />
            ) : (
              <span>{value ? '是' : '否'}</span>
            );
          },
        },
        {
          title: '是否唯一',
          width: 120,
          dataIndex: 'unionFlag',
          render: (value, record, index) => {
            return record.status == 'edit' || record.status == 'new' ? (
              <Switch onChange={value => this.change('unionFlag', value, record)} checked={value} />
            ) : (
              <span>{value ? '是' : '否'}</span>
            );
          },
        },
        {
          title: '操作',
          fixed: 'right',
          dataIndex: 'option',
          width: 160,
          align: 'center',
          render: (value, record, index) => {
            return record.status == 'edit' || record.status == 'new' ? (
              <span>
                <a onClick={() => this.save(record)}>保存</a>
                <Divider type="vertical" />
                <a onClick={() => this.cancel(record)}>取消</a>
              </span>
            ) : (
              <span>
                {record.type == 'object' && (
                  <a onClick={() => this.addChildren(record, index)}>添加</a>
                )}
                {record.type == 'object' && <Divider type="vertical" />}
                <a onClick={() => this.edit(record)}>编辑</a>
                <Divider type="vertical" />
                <a onClick={() => this.delete(record, index)}>删除</a>
              </span>
            );
          },
        },
      ],
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.id != nextProps.id) {
      this.setState({ loading: true });
      service.getRequestList(nextProps.id).then(res => {
        res.map(item => {
          item.status = 'normal';
          item.level = 1;
        });
        this.setState({ dataSource: res, loading: false });
      });
    }
  }

  componentDidMount() {
    service.getRequestList(this.props.id).then(res => {
      res.map(item => {
        item.status = 'normal';
        item.level = 1;
      });
      this.setState({ dataSource: res });
    });
  }

  change = (key, value, { id }) => {
    let dataSource = this.state.dataSource;
    let record = this.getDataById(dataSource, id);
    record[key] = value;
    this.setState({ dataSource });
  };

  save = ({ id }) => {
    let dataSource = this.state.dataSource;
    let record = this.getDataById(dataSource, id);
    let params = { ...record, interfaceId: this.props.id };
    if (!params.id || params.id == '0') {
      delete params.id;
      service
        .addRequest(params)
        .then(res => {
          record.id = res.id;
          record.status = 'normal';
          this.setState({ dataSource, isEdit: false });
        })
        .catch(err => {
          message.error('保存失败！');
        });
    } else {
      service
        .updateRequest(params)
        .then(res => {
          record.id = res.id;
          record.status = 'normal';
          record.versionNumber = res.versionNumber;
          this.setState({ dataSource, isEdit: false });
        })
        .catch(err => {
          message.error('保存失败！');
        });
    }
  };

  cancel = record => {
    let dataSource = this.state.dataSource;

    let parent = this.getDataById(dataSource, record.parentId);

    let status = record.status;

    if (status == 'new') {
      if (parent) {
        parent.children.splice(parent.children.findIndex(o => o.id == record.id), 1);
      } else {
        dataSource.splice(dataSource.findIndex(o => o.id == record.id), 1);
      }
    } else if (status == 'edit') {
      if (parent) {
        parent.children[parent.children.findIndex(o => o.id == record.id)] = this.state.record;
      } else {
        dataSource[dataSource.findIndex(o => o.id == record.id)] = this.state.record;
      }
    }

    this.setState({ dataSource, record: null, isEdit: false });
  };

  edit = ({ id }) => {
    if (this.state.isEdit) {
      message.warning('有未保存的数据，请先保存！');
      return;
    }

    let dataSource = this.state.dataSource;
    let data = this.getDataById(dataSource, id);

    let record = { ...data };
    data.status = 'edit';
    this.setState({ dataSource, record, isEdit: true });
  };

  add = () => {
    if (this.state.isEdit) {
      message.warning('有未保存的数据，请先保存！');
      return;
    }

    let dataSource = this.state.dataSource;
    let id = this.state.id;

    dataSource.push({
      id: '0',
      status: 'new',
      level: 1,
      parentId: 0,
    });
    this.setState({ dataSource, isEdit: true, id: id + 1 });
  };

  delete = (record, index) => {
    service.deleteRequest(record.id).then(res => {
      message.success('删除成功！');
      let dataSource = this.state.dataSource;
      dataSource.splice(index, 1);
      this.setState({ dataSource });
    });
  };

  expand = expandedRowKeys => {
    this.setState({ expandedRowKeys });
  };

  addChildren = data => {
    if (this.state.isEdit) {
      message.warning('有未保存的数据，请先保存！');
      return;
    }

    let expandedRowKeys = this.state.expandedRowKeys;
    let dataSource = this.state.dataSource;
    let record = this.getDataById(dataSource, data.id);

    if (record.children) {
      record.children.push({
        id: '0',
        status: 'new',
        level: record.level + 1,
        parentId: record.id,
      });
    } else {
      record.children = [
        {
          id: '0',
          status: 'new',
          level: record.level + 1,
          parentId: record.id,
        },
      ];
    }
    expandedRowKeys.push(record.id);
    this.setState({ dataSource, isEdit: true, expandedRowKeys });
  };

  getLastKey = pos => {
    if (!pos) return 0;
    return pos.split('-')[pos.split('-').length - 1];
  };

  getParent = (dataSource, pos) => {
    if (String(pos).includes('-')) {
      let posArray = pos.split('-');
      posArray.splice(posArray.length - 1, 1);
      return this.getDataByPos(dataSource, posArray.join('-'));
    } else {
      return null;
    }
  };

  getDataById = (dataSource, id) => {
    //let data = dataSource.find(o=> o.id == id);
    if (!id) return null;
    for (let i = 0; i < dataSource.length; i++) {
      if (dataSource[i].id == id) {
        return dataSource[i];
      } else {
        let data = this.getDataById(dataSource[i].children || [], id);
        if (data) {
          return data;
        }
      }
    }
  };

  render() {
    const { dataSource, columns, expandedRowKeys, loading } = this.state;
    return (
      <div className="request-params">
        <div style={{ marginTop: 0, marginBottom: 20 }} className="table-header">
          <Button onClick={this.add} type="primary">
            添加
          </Button>
        </div>
        <Table
          indentSize={14}
          rowKey="id"
          size="small"
          dataSource={dataSource}
          columns={columns}
          expandedRowKeys={expandedRowKeys}
          onExpandedRowsChange={this.expand}
          scroll={{ y: 320, x: 1100 }}
          pagination={false}
          loading={loading}
        />
      </div>
    );
  }
}
export default RequestParams;