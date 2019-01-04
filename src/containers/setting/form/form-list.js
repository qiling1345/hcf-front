
import React from 'react';
import {connect} from 'dva';

import {
  Button, Popover, message, Col, Row, Dropdown,
  Icon, Menu, Tabs, Badge, Select, Input
} from 'antd';
import Table from 'widget/table'

const TabPane = Tabs.TabPane;
// import menuRoute from 'routes/menuRoute';
import formService from 'containers/setting/form/form.service';
import constants from 'share/constants';
import BaseService from 'share/base.service';
import Selector from 'widget/selector'

import 'styles/setting/form/form-list.scss';
import { routerRedux } from 'dva/router';
const Option = Select.Option;
import workflowService from 'containers/setting/workflow/workflow.service'

import debounce from 'lodash.debounce';

class FormList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      formList: [],
      formListForSob: [],
      setOfBooks: [], //账套list
      setOfBooksId: this.props.match.params.setOfBooksId || this.props.company.setOfBooksId,
      setOfBooksName: this.props.company.setOfBooksName,
      loading: true,
      params:{},
      columnsForSobFrom: [
        {
          title: this.$t('common.sequence'/*序号*/),
          dataIndex: 'sequence',
          width: '8%'
        },
        {
          title: this.$t('common.document.name'/*单据名称*/),
          dataIndex: 'formName',
          render: value => value ? <Popover placement="topLeft" content={value}>{value}</Popover> : '-'
        },
        {
          title: this.$t("common.comment")/*备注*/,
          dataIndex: 'remark',
          width: '30%'
        },
        {
          title: this.$t('form.setting.applicable')/*'适用人员'*/,
          dataIndex: 'visibleUserScope',
          render: text => constants.getTextByValue(text, 'visibleUserScope')
        },
        {
          title: this.$t('form.setting.include.fee.type')/*'包含费用类型'*/,
          dataIndex: 'visibleExpenseTypeScope',
          render: text => constants.getTextByValue(text, 'visibleExpenseTypeScope')
        },
        {
          title: this.$t('common.column.status'/*状态*/),
          dataIndex: 'valid', width: '15%',
          render: valid =>
            <Badge status={valid ? 'success' : 'error'}
                   text={valid ? this.$t('common.status.enable') : this.$t('common.status.disable')}/>
        }
        /*{title: '操作', dataIndex: 'operate', width: '8%', render: record => (
          <span>
            <Popconfirm title="确认删除吗？" onConfirm={(e) => this.deleteExpense(e, record)}>
              <a>{this.$t("common.delete")}</a>
            </Popconfirm>
          </span>
        )}*/
      ], //公司模式下账套级表单columns
      columns: [
        {
          title: this.$t('common.sequence'/*序号*/),
          dataIndex: 'sequence',
          width: '8%'
        },
        {
          title: this.$t('common.document.name'/*单据名称*/),
          dataIndex: 'formName',
          render: value => value ? <Popover placement="topLeft" content={value}>{value}</Popover> : '-'
        },
        {
          title: this.$t("common.comment")/*备注*/,
          dataIndex: 'remark',
          width: '30%'
        },
        {
          title: this.$t('form.setting.applicable')/*'适用人员'*/,
          dataIndex: 'visibleUserScope',
          render: text => constants.getTextByValue(text, 'visibleUserScope')
        },
        {
          title: this.$t('form.setting.include.fee.type')/*'包含费用类型'*/,
          dataIndex: 'visibleExpenseTypeScope',
          render: text => constants.getTextByValue(text, 'visibleExpenseTypeScope')
        },
        {
          title: this.$t('common.column.status'/*状态*/),
          dataIndex: 'valid', width: '15%',
          render: valid =>
            <Badge status={valid ? 'success' : 'error'}
                   text={valid ? this.$t('common.status.enable') : this.$t('common.status.disable')}/>
        }
        /*{title: '操作', dataIndex: 'operate', width: '8%', render: record => (
          <span>
            <Popconfirm title="确认删除吗？" onConfirm={(e) => this.deleteExpense(e, record)}>
              <a>{this.$t("common.delete")}</a>
            </Popconfirm>
          </span>
        )}*/
      ], //公司模式下columns
      columnsTenant: [
        {
          title: this.$t('common.sequence'/*序号*/),
          dataIndex: 'sequence', width: '8%'
        },
        {
          title: this.$t('common.document.name'/*单据名称*/),
          dataIndex: 'formName',
          render: value => value ? <Popover placement="topLeft" content={value}>{value}</Popover> : '-'
        },
        {
          title: this.$t("common.comment")/*备注*/,
          dataIndex: 'remark', width: '30%'
        },
        {
          title: this.$t("form.setting.applicable.company")/*'适用公司'*/,
          dataIndex: 'visibleCompanyScope',
          render: text => constants.getTextByValue(text, 'visibleCompanyScope')
        },
        {
          title: this.$t('form.setting.include.fee.type')/*'包含费用类型'*/,
          dataIndex: 'visibleExpenseTypeScope',
          render: text => constants.getTextByValue(text, 'visibleExpenseTypeScope')
        },
        {
          title: this.$t('common.column.status'/*状态*/),
          dataIndex: 'valid', width: '15%',
          render: valid =>
            <Badge status={valid ? 'success' : 'error'}
                   text={valid ? this.$t('common.status.enable') : this.$t('common.status.disable')}/>
        }
        /*{title: '操作', dataIndex: 'operate', width: '8%', render: record => (
          <span>
            <Popconfirm title="确认删除吗？" onConfirm={(e) => this.deleteExpense(e, record)}>
              <a>{this.$t("common.delete")}</a>
            </Popconfirm>
          </span>
        )}*/
      ] //集团模式下columns
    };
    this.handleDocType = debounce(this.handleDocType, 500);
  }

  componentDidMount() {
    if (this.props.tenantMode) {
      BaseService.getSetOfBooksByTenant().then(resp => {
        if (resp.status === 200 && resp.data) {
          this.setState({
            setOfBooks: resp.data,
            setOfBooksId: this.props.company.setOfBooksId,
            setOfBooksName: this.props.company.setOfBooksName
          });
          this.getList();
        }
      }).catch(error => {
        message.error(this.$t('common.error'));
      });
    }
  }

/*  componentWillMount() {

    if (!this.props.tenantMode) {
      //this.getFormList();
      this.getList();
      //获取账套下表单
     // this.getFormListForSob();
    }
  }*/

  getList = () => {
    this.setState({ loading: true });
    let params = {
      ...this.state.params,
      booksID: this.props.tenantMode ? this.state.setOfBooksId : '',
    };
    workflowService.getWorkflowList(params).then(res => {

      this.setState({
        loading: false,
        formList: res.data
      })
    })
  };

  handleMenuClick = (e) => {
    this.props.dispatch(
      routerRedux.push({
        pathname: `/admin-setting/form-list/new-form/${e.key}/${this.state.currentSetOfBooksID?this.state.currentSetOfBooksID:0}`,
      })
    );
  };

 /* handleSetOfBooksChange = (value) => {
    this.setState({
      currentSetOfBooksID: value.id,
      currentSetOfBooksName: value.setOfBooksName,
    }, () => {
      this.getFormList(value.id)
    })
  }*/;

  //集团模式下改变帐套
  handleSetOfBooksChange = (value) => {
    this.setState({
      setOfBooksId: value.id,
      setOfBooksName: value.setOfBooksName,
      showEnableList: true
    }, () => {
      this.getList()
    })
  };

  expandedRowRender =(record)=>{
    console.log(record)
    console.log(record)
  };

  getFormList = (id) => {
    this.setState({loading: true})
    let params = {
      booksID: id || this.props.company.setOfBooksId,
      ...this.state.params
    };

    if (!this.props.tenantMode) {
      //公司模式
      params.fromType = 1;
    }
    formService.getFormList(params)
      .then(res => {
        if (res.data) {
          this.handleFormList(res.data);
        }
        this.setState({
          formList: res.data,
          loading: false
        });
      })
  };
  //获取当前账套的
  getFormListForSob = () => {
    let params = {};
    //公司模式
    params.fromType = 2;
    formService.getFormList(params)
      .then(res => {
        if (res.data) {
          this.handleFormList(res.data);
        }
        this.setState({
          formListForSob: res.data,
          loading: false
        });
      })
  };

/*  handleCatType = (value)=>{
    this.setState({
      params: {
        ...this.state.params,
        formTypeId: value
      }
    },()=>this.getFormList())
  };

  handleDocType = (value)=>{
    this.setState({
      params: {
        ...this.state.params,
        formName: value
      }
    },()=>this.getFormList())
  };*/

  handleCatType = (value) => {
    this.setState({
      params: {
        ...this.state.params,
        documentCategory: value
      }
    }, () => this.getList())
  };

  handleDocType = (value) => {
    this.setState({
      params: {
        ...this.state.params,
        formName: value
      }
    }, () => this.getList())
  };

  /*
   以下操作主要是为了list的排序，找到申请单关联的报销单，并且给他们排序号
   */
  handleFormList = (formList) => {
    let i = formList.length - 1;
    while (i >= 0){
      if (formList[i] && formList[i].referenceOid && this.isApplicationReport(formList[i].formType)){
        //判断是否是申请单
        //然后找到申请单关联的报销单
        let referenceFormIndex = this.checkFormInList(formList[i].referenceOid, formList);
        if (referenceFormIndex != null) {
          //现在把这个报销单拿出，插入申请单的前面。
          // 第一步，拿出，
          // 第二步，添加属性reference，说明这个是和申请单关联的报销单，
          // 第三步，插入i之后
          let referenceForm = formList.splice(referenceFormIndex, 1);
          referenceForm[0].reference = true;
          formList.splice(i, 0, referenceForm[0]);
        }
      }
      i--;
    }
    //现在重新给每个form添加序号，如果遇到关联了申请单的报销单，不写序号，跳过
    let sequence = 0;
    //jump控制，如果是true，跳过，不需要赋值sequence。如果false，则是正常的表单，需要赋值
    let jump = false;
    for (let i = 0; i < formList.length; i++) {
      if (!jump){
        //如果不是关联的，不需要跳过，加sequence，否则跳过
        sequence++;
        formList[i].sequence = sequence;
      }
      if (!formList[i].reference){
        //如果没有关联的话，不需要jump
        jump = false;
      }
      else{
        //如果有关联的话，下一步jump跳过
        jump = true;
      }
    }
  };

  //检查referenceOid是否存在list里面
  checkFormInList = (referenceOid, list) => {
    for(let i = 0; i < list.length; i++){
      if (list[i].formOid == referenceOid){
        return i
      }
    }
    return null;
  };

  //根据formType判断是否申请单，1000和2000开头的就是申请单，3000后是报销单
  isApplicationReport = (formType) => {
    if (formType<3000 && formType >=1000){
      return true;
    } else {
      return false;
    }
  };

  getCurrentSetOfBooksName = (id) => {
    let currentSetOfBooksName = '';
    this.state.setOfBooks.map((item) => {
      if (item.id === id) {
        currentSetOfBooksName = item.setOfBooksName;
      }
    });
    return currentSetOfBooksName;
  };

  rowClick = (record) => {
    this.props.dispatch(
      routerRedux.push({
        pathname: `/admin-setting/form-list/form-detail/${record.formOid}/${this.state.currentSetOfBooksID}`
      })
    )  
  };
  rowClickForSob = (record) => {
    this.props.dispatch(
      routerRedux.push({
        pathname: `/admin-setting/form-list/form-detail/${record.formOid}/${this.state.currentSetOfBooksID}`
      })
    )  
  };
  //Tabs点击
  onChangeTabs = (key) => {
  };
  renderCompanyTab = () => {
    const {
      columns, columnsTenant, formList, loading,
      columnsForSobFrom, formListForSob,
      setOfBooksId,
      setOfBooksName
    } = this.state;
    const menu = (
      <Menu onClick={this.handleMenuClick} >
        {constants.documentType.map(item => <Menu.Item key={item.value}>{item.text}</Menu.Item>)}
      </Menu>
    );
   /* const menuSetOfBooks = (
      <Menu onClick={this.handleSearchList} >
        {this.state.setOfBooks.map(item => <Menu.Item key={item.id}>{item.setOfBooksName}</Menu.Item>)}
      </Menu>
    );*/
    const { tenantMode, language } = this.props;
    return (
      <div>
        {this.props.tenantMode && (
          <div className="setOfBooks-container" style={{
            borderBottom: '1px solid #e8e8e8',
            marginBottom: 20,
            width: '100%', height: 53}}>
            <Row className="setOfBooks-select">
              <Col span={language.local === 'zh_cn' ? 1 : 2} style={{lineHeight:2, width: 43 }} className="title">{this.$t('setting.key1428'/*帐套*/)}：</Col>
              <Col span={3}>
                <Selector type="setOfBooksByTenant"
                          allowClear={false}
                          entity
                          value={{ label: setOfBooksName, key: setOfBooksId }}
                          onChange={this.handleSetOfBooksChange}
                />
              </Col>
              <Col span={language.local === 'zh_cn' ? 2 : 3} style={{lineHeight:2, width: 72 }} className="title" offset={1}>{this.$t('common.document.categories'/*单据大类*/)}：</Col>
              <Col span={3}>
                <Select
                  allowClear
                  onChange={this.handleCatType}
                  style={{ width: '100%' }}
                  placeholder={this.$t('common.please.select')}>
                  {
                    constants.documentType.map(item => <Option key={item.value}>{item.text}</Option>)
                  }
                </Select>
              </Col>
              <Col span={language.local === 'zh_cn' ? 3 : 4} style={{lineHeight:2, width: 100 }} className="title" offset={1}>{this.$t('acp.public.documentTypeName'/*单据类型名称*/)}：</Col>
              <Col span={3} >
                <Input
                  onChange={e => this.handleDocType(e.target.value)}
                  placeholder={this.$t('common.please.enter')} />
              </Col>
            </Row>
          </div>
        )}
        <div id="form-list2-drop" style={{position : "relative"}}>
          <Dropdown getPopupContainer={ () => document.getElementById('form-list2-drop')} overlay={menu} trigger={['click']}>
            <Button type="primary">
              {this.$t('form.setting.new.form')/*新建表单*/} <Icon type="down"/>
           </Button>
         </Dropdown>
        </div>
        <div style={{height: 20}}/>
        <Table columns={this.props.tenantMode ? columnsTenant : columns}
               loading={loading}
               dataSource={formList}
               size="middle"
               bordered
               rowKey="formOid"
               expandedRowRender={this.expandedRowRender}
               pagination={false}
               onRow={record => ({
                 onClick: () => this.rowClick(record)
               })}
        />
        <div style={{height: 20}}/>
      </div>
    )
  }
  renderSobTab = () => {
    const {
      columns, columnsTenant, formList, loading,
      columnsForSobFrom, formListForSob,
      currentSetOfBooksName
    } = this.state;
    return (
      <div>
        <div className="condition-rule-icon-tips">
          <Icon type="info-circle" style={{color: '#1890ff'}}/>
          <span className="tips-text">
            {this.$t('form.setting.toast')/* 账套级表单由系统管理员分配，不能修改。*/}
                </span>
        </div>
        <div style={{height: 20}}/>
        <Table columns={columnsForSobFrom}
               loading={loading}
               dataSource={formListForSob}
               size="middle"
               bordered
               rowKey="formOid"
               pagination={false}
               onRow={record => ({
                 onClick: () => this.rowClickForSob(record)
               })}
        />
        <div style={{height: 20}}/>
      </div>

    )
  }
  renderCompanyTenant = () => {
    if (this.props.tenantMode) {
      return this.renderCompanyTab();
    } else {
      return (
        <Tabs defaultActiveKey="1" onChange={this.onChangeTabs}>
          <TabPane tab={this.$t('form.setting.company.form')/*公司级表单*/} key="companyFrom">
            {this.renderCompanyTab()}
          </TabPane>
          <TabPane tab={this.$t('form.setting.set.of.books.form')/*帐套级表单*/} key="sobFrom" disabled={this.props.tenantMode}>
            {this.renderSobTab()}
          </TabPane>
        </Tabs>
      )
    }
  }

  render() {
    return (
      <div className="form-design-form-list">
        {this.renderCompanyTenant()}
      </div>
    )
  }

}

// FormList.contextTypes = {
//   router: React.PropTypes.object
// };

function mapStateToProps(state) {
  return {
    company: state.user.company,
    tenantMode:true,
    language: state.languages,
  }
}

export default connect(mapStateToProps, null, null, { withRef: true })(FormList);
