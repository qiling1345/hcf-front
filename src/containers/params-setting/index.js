import React, { Component } from "react"
import SearchArea from "widget/search-area"
import { Button, Table, Divider, message, Popconfirm } from "antd"
import SlideFrame from "widget/slide-frame"
import NewParamsSetting from "./new-params-setting"
import service from "./service"

import "styles/setting/params-setting/params-setting.scss"


class ParamsSetting extends Component {
    constructor(props) {
        super(props);
        this.state = {
            searchForm: [
                {
                    type: "input",
                    id: "tableName",
                    placeholder: "请输入",
                    label: "表名称",
                    colSpan: 6
                },
                {
                    type: "value_list",
                    id: "dataType",
                    placeholder: "请选择",
                    label: "参数类型",
                    valueListCode: 3101,
                    options: [],
                    colSpan: 6
                },
                {
                    type: "value_list",
                    id: "filterMethod",
                    placeholder: "请选择",
                    label: "筛选方式",
                    valueListCode: 3104,
                    options: [],
                    colSpan: 6
                },
                {
                    type: "input",
                    id: "columnName",
                    placeholder: "请输入",
                    label: "参数名称",
                    colSpan: 6
                },
            ],
            columns: [
                {
                    title: "表名称",
                    dataIndex: "tableName",
                    align: "center"
                },
                {
                    title: "参数类型",
                    dataIndex: "dataType",
                    align: "center"
                },
                {
                    title: "筛选方式",
                    dataIndex: "filterMethod",
                    align: "center"
                },
                {
                    title: "关联条件",
                    dataIndex: "customSql",
                    align: "center"
                },
                {
                    title: "参数名称",
                    dataIndex: "columnName",
                    align: "center"
                },
                {
                    title: "操作",
                    dataIndex: "id",
                    align: "center",
                    render: (value, record, index) => {
                        return (<span>
                            <a onClick={() => this.edit(record)}>编辑</a>
                            <Divider type="vertical" />
                            <Popconfirm title="确定删除？" onConfirm={() => this.delete(record.id)} okText="确定" cancelText="取消">
                                <a>删除</a>
                            </Popconfirm>
                        </span>)
                    }
                }
            ],
            data: [],
            searchParams: {},
            loading: false,
            visibel: false,
            size: 10,
            page: 0,
            pagination: {},
            model: {}
        }
    }

    //页面加载时调用，只会调用一次
    componentDidMount() {
        this.getList();
    }

    //新建
    create = () => {
        this.setState({
            visibel: true
        })
    }

    //编辑
    edit = (record) => {
        this.setState({ model: JSON.parse(JSON.stringify(record)), visibel: true });
    }

    //删除
    delete = (id) => {
        service.deleteParamsSetting(id).then(res => {
            message.success("删除成功！");
            this.setState({ page: 0 }, () => {
                this.getList();
            })
        }).catch(err => {
            message.error(err.response.data.message);
        })
    }

    //搜索
    search = (values) => {

        Object.keys(values).map(key => {
            if (!values[key]) {
                delete values[key]
            }
        });

        this.setState({ searchParams: values, page: 0 }, () => {
            this.getList();
        });
    }

    //获取列表
    getList = () => {
        let { searchParams, size, page, pagination } = this.state;
        this.setState({ loading: true });
        service.getParamsSettingList({ ...searchParams, size, page }).then(res => {
            pagination.total = Number(res.headers["x-total-count"]);
            this.setState({
                data: res.data,
                loading: false,
                pagination
            });
        }).catch(err => {
            message.error(err.response.data.message);
            this.setState({ loading: false });
        })
    }

    //关闭侧拉框回调
    close = (flag) => {
        this.setState({ visibel: false, model: {} }, () => {
            if (flag) {
                this.getList();
            }
        })
    }

    //分页回调
    handleTableChange = (pagination) => {
        this.setState({
            size: pagination.pageSize || 10,
            page: pagination.current - 1
        }, () => {
            this.getList();
        })
    }

    render() {
        const { searchForm, columns, data, loading, visibel, pagination, model } = this.state;

        return (
            <div className="params-setting">
                <SearchArea
                    searchForm={searchForm}
                    submitHandle={this.search}
                />
                <Button style={{ margin: "20px 0" }} className="create-btn" type="primary" onClick={this.create}>新建</Button>
                <Table
                    rowKey={record => record.id}
                    columns={columns}
                    dataSource={data}
                    bordered
                    loading={loading}
                    size="middle"
                    pagination={pagination}
                    onChange={this.handleTableChange}
                />
                <SlideFrame
                    title={model.id ? "编辑参数配置" : "新建参数配置"}
                    show={visibel}
                    onClose={() => {
                        this.setState({
                            visibel: false,
                            model: {}
                        })
                    }}
                >
                    <NewParamsSetting params={model} close={this.close} />
                </SlideFrame>
            </div>
        )
    }
}

export default ParamsSetting