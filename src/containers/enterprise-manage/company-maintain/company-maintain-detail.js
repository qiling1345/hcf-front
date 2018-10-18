import {messages} from "share/common";
// 为了0416迭代上线，重构此文件
import React from 'react';
import {connect} from 'react-redux'

import menuRoute from 'routes/menuRoute';
import {Form, Button, Icon, Tabs, Table, message, Popover} from 'antd';
import 'styles/budget-setting/budget-organization/budget-structure/budget-structure-detail.scss';
import ListSelector from 'components/list-selector';
import companyMaintainService from 'containers/enterprise-manage/company-maintain/company-maintain.service';
const TabPane = Tabs.TabPane;


class WrappedCompanyMaintainDetail extends React.Component {

  constructor(props) {
    super(props);


    this.state = {
      showImportFrame: false,
      saving: false,
      loading: true,
      pagination: {
        current: 1,
        page: 0,
        total: 0,
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
      },
      selectedRowKeys: [],
      tabs: [
        {
          key: 'BANK',
          name: messages('company.maintain.bankAccountInfo1')
        }, /*银行账户信息*/
        {
          key: 'USER',
          name: messages('company.maintain.userInfo1')
        }  /*员工信息*/
      ],
      data: [],
      tabsData: {
        BANK: {
          rowSelection: null,
          columns:
            [
              {
                //银行名称
                title: messages('company.maintain.bank.account.bankName'),
                dataIndex: 'bankName', width: '15%',
                render: desc => <span><Popover content={desc}>{desc ? desc : "-"}</Popover></span>
              },
              {
                //支行名称
                title: messages('bank.bankBranchName'),
                dataIndex: 'bankBranchName',
                width: '15%',
                render: bankBranchName => <span><Popover content={bankBranchName}>{bankBranchName ? bankBranchName : "-"}</Popover></span>
              },
              {
                //国家
                title: messages('company.maintain.bank.account.country'),
                dataIndex: 'country',
                width: '15%',
                render: desc => <span><Popover content={desc}>{desc ? desc : "-"}</Popover></span>
              },
              {
                //开户地
                title: messages('company.maintain.bank.account.opening'),
                dataIndex: 'bankAddress',
                width: '15%',
              },
              {
                //详细地址
                title: messages('company.maintain.bank.account.bankAddress'),
                dataIndex: 'accountOpeningAddress',
                width: '15%',
                render: desc => <span><Popover content={desc}>{desc ? desc : "-"}</Popover></span>
              },
              {
                //账户名称
                title: messages('company.maintain.bank.account.bankAccountName'),
                dataIndex: 'bankAccountName',
                width: '15%',
                render: desc => <span><Popover content={desc}>{desc ? desc : "-"}</Popover></span>
              },
              {
                //银行账户账号
                title: messages('company.maintain.bank.account.bankAccountNumber'),
                dataIndex: 'bankAccountNumber',
                width: '15%',
                render: desc => <span><Popover content={desc}>{desc ? desc : "-"}</Popover></span>
              },
              {
                //swiftCode
                title: messages('company.maintain.bank.account.swiftCode'),
                dataIndex: 'swiftCode',
                width: '12%',
                render: desc => <span><Popover content={desc}>{desc ? desc : "-"}</Popover></span>
              },
              {
                title: messages('company.maintain.bank.account.remark'),
                dataIndex: 'remark',
                width: '15%',
                render: remark => (
                  <Popover content={remark}>
                    {remark ? remark : '-'}
                  </Popover>)
              },
              {
                title: messages('common.operation'),
                dataIndex: 'operation',
                width: '10%',
                render: (text, record) => (
                  <span>
                    <a onClick={(e) => this.editItem(e, record)}>{messages('common.edit')}</a>
                  </span>)
              }
            ]
        },
        USER: {
          rowSelection: {
            type: 'checkbox',
            selectedRowKeys: [],
            onChange: this.onSelectChange,
          },
          columns:
            [
              {
                title: messages('company.maintain.fullName1'),
                key: "fullName",
                dataIndex: 'fullName',
                width: '16%'
              }, /*姓名*/
              {
                title: messages('company.maintain.id1'),
                key: "id",
                dataIndex: 'employeeID',
                width: '8%'
              }, /*工号*/
              {
                title: messages('company.maintain.departmentName1'),
                key: "departmentName",
                dataIndex: 'departmentName',
                width: '10%'
              }, /*部门名称*/
              {
                title: messages('company.maintain.mobile1'),
                key: "mobile",
                dataIndex: 'mobile',
                width: '10%'
              }, /*联系方式*/
              {
                title: messages('company.maintain.email1'),
                key: "email",
                dataIndex: 'email',
                width: '10%'
              }, /*邮箱*/
              {
                title: messages("common.column.status"),// "状态",
                key: "status",
                dataIndex: 'status',
                render: (text) => {
                  if (text === 1001) {
                    return (<span>
                          <Popover placement="topLeft" content={messages("person.manage.working.person")}>
                          {messages("person.manage.working.person")}
                          </Popover>
                        </span>)
                  } else if (text === 1002) {
                    return (<span>
                            <Popover placement="topLeft" content={messages("person.manage.will.go.person")}>
                            {messages("person.manage.will.go.person")}
                            </Popover>
                          </span>)
                  } else if (text === 1003) {
                    return (<span>
                            <Popover placement="topLeft" content={messages("person.manage.gone.person")}>
                            {messages("person.manage.gone.person")}
                            </Popover>
                          </span>)
                  }
                }
              },
            ]
        },
      },
      // rowSelection: {
      //   type: 'checkbox',
      //   selectedRowKeys: [],
      //   onChange: this.onSelectChange,
      // },
      nowStatus: 'BANK',
      newBankAccountPage: menuRoute.getRouteItem('new-bank-account', 'key'),                    //新建银行账户
    }
  }

  componentDidMount() {
    this.getList(this.state.nowStatus);
  }

  //根据tab的key获取对应的列表
  getList = (key) => {
    if (key === 'BANK') {
      this.getBankAccountInfo();
    } else {
      this.getUserInfo();
    }
  };
  //获取银行账户列表
  getBankAccountInfo = () => {
    const {pagination} = this.state;
    let params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      companyId: this.props.params.companyId
    };
    companyMaintainService.getBankAccountInfo(params)
      .then(response => {
        response.data.map((item, index) => {
          item.key = item.id ? item.id : index;
        });
        pagination.total = Number(response.headers['x-total-count']);
        this.setState({
          data: response.data,
          loading: false,
          pagination
        })
      })
  }
  //获取公司人员
  getUserInfo = () => {
    const {pagination} = this.state;
    let params = {
      page: pagination.page,
      size: pagination.pageSize,
      corporationOID: this.props.params.companyOId
    };
    companyMaintainService.getUserInfo(params)
      .then(response => {
        response.data.map((item, index) => {
          item.key = item.id ? item.id : index;
        });
        pagination.total = Number(response.headers['x-total-count']);
        this.setState({
          data: response.data,
          loading: false,
          pagination
        })
      })
  }
  //选项改变时的回调，重置selection
  onSelectChange = (selectedRowKeys, selectedRows) => {
    let tabsData = this.state.tabsData;
    tabsData.USER.rowSelection.selectedRowKeys = selectedRowKeys;
    this.setState({tabsData, selectedRowKeys});
  };

  //编辑
  editItem = (e, record) => {
    let path = this.state.newBankAccountPage.url.replace(":companyOId", this.props.params.companyOId)
      .replace(":companyId", this.props.params.companyId).replace(":flag", record.id);
    this.context.router.push(path);
  };
  //分页点击
  onChangePager = (pagination, filters, sorter) => {
    let temp = this.state.pagination;
    temp.page = pagination.current - 1;
    temp.current = pagination.current;
    temp.pageSize = pagination.pageSize;
    this.setState({
      loading: true,
      pagination: temp
    }, () => {
      this.getList(this.state.nowStatus);
    })
  };

  //渲染Tabs
  renderTabs = () => {
    return (
      this.state.tabs.map(tab => {
        return <TabPane tab={tab.name} key={tab.key}/>
      })
    )
  };

  //点击
  onChangeTabs = (key) => {
    let pagination = this.state.pagination;
    pagination.page = 0;
    pagination.pageSize = 10;
    this.setState({
      nowStatus: key,
      loading: true,
      pagination,
      data: [],
    }, () => {
      this.getList(key);
    })

  };

  //新建
  handleNew = () => {
    let path = this.state.newBankAccountPage.url.replace(":companyOId", this.props.params.companyOId)
      .replace(":companyId", this.props.params.companyId).replace(":flag", 'create');
    this.context.router.push(path);
  };

  //返回
  handleBack = () => {
    this.context.router.goBack();
  };

  //渲染按钮
  renderButton = () => {
    const {saving, pagination, selectedRowKeys} = this.state;

    if (this.state.nowStatus === "USER") {
      return (
        <div>
          <div className="table-header-title">
            {/*共 {pagination.total} 条数据 / 已经选择了 {this.state.selectedRowKeys.length} 条数据*/}

            {
              messages("common.total1",{total:pagination.total})
            }
            /
            {
              messages("common.total.selected",{total:this.state.selectedRowKeys.length})
            }
          </div>
          <div className="table-header-buttons">
            <Button onClick={this.removeUser}
                    disabled={selectedRowKeys.length <= 0}>
              {/*移动*/}
              {messages("common.move")}
            </Button>
          </div>
        </div>
      )
    } else {
      return (
        <div>
          <div className="table-header-title">
            {/*共 {pagination.total} 条数据*/}
            {
              messages("common.total1",{total:pagination.total})
            }
          </div>
          <div className="table-header-buttons">
            <Button type="primary"
                    onClick={this.handleNew}
                    loading={saving}>
              {messages('common.create')}
            </Button>
          </div>
        </div>
      )
    }
  };

  //确认移动员工
  submitHandle = (value) => {
    const companyOIDTo = value.result[0].companyOID;
    const companyOIDFrom = this.props.params.companyOId;
    const selectedRowKeys = this.state.selectedRowKeys;
    let params = {
      companyOIDFrom: companyOIDFrom,
      companyOIDTo: companyOIDTo,
      userOIDs: selectedRowKeys,
      selectMode: "default"
    }
    companyMaintainService.movePersonToCompany(params)
      .then((res) => {
        message.success(messages('common.operate.success'));
        this.getList(this.state.nowStatus);
        this.setState({
          selectedRowKeys: [],
        })
        this.showImport(false)
      })
  };

  //员工移动
  removeUser = () => {
    this.showImport(true)
  };

  showImport = (value) => {
    this.setState({
      showImportFrame: value
    })
  };

  cancelHandle = () => {
    this.showImport(false)
  };

  render() {
    const {
      tabsData,
      loading,
      pagination,
      nowStatus,
      data,
      } = this.state;

    return (
      <div>
        <Tabs onChange={this.onChangeTabs} style={{marginTop: 20}}>
          {this.renderTabs()}
        </Tabs>
        <div className="table-header">
          {this.renderButton()}
        </div>
        <Table columns={tabsData[nowStatus].columns}
               dataSource={data}
               pagination={pagination}
               onChange={this.onChangePager}
               loading={loading}
               bordered
               size="middle"
               rowKey={(reCode) => {
                 return reCode.userOID
               }}
               rowSelection={tabsData[nowStatus].rowSelection}
        />
        <a style={{fontSize: '14px', paddingBottom: '20px'}} onClick={this.handleBack}>
          <Icon type="rollback"
                style={{marginRight: '5px'}}/>
          {messages('common.back')}
        </a>

        <ListSelector visible={this.state.showImportFrame}
                      onOk={this.submitHandle}
                      onCancel={this.cancelHandle}
                      type='available_company'
                      single={true}
                      extraParams={{"versionId": this.props.params.versionId,"enabled":true}}
        />


      </div>
    )
  }

}

WrappedCompanyMaintainDetail.contextTypes = {
  router: React.PropTypes.object
};

function mapStateToProps(state) {
  return {}
}

const CompanyMaintainDetail = Form.create()(WrappedCompanyMaintainDetail);

export default connect(mapStateToProps, null, null, { withRef: true })(CompanyMaintainDetail);