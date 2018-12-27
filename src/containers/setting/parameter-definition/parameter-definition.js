/**
 * created by jsq on 2018/12/26
 */
import React from 'react'
import { connect } from 'dva'
import {Button, Badge, notification, Popover, Tabs, Divider, Popconfirm} from 'antd';
import { routerRedux } from 'dva/router';
import Table from 'widget/table'
import SearchArea from 'widget/search-area';
import NewParameterDefinition from 'containers/setting/parameter-definition/new-parameter-definition'
const TabPane = Tabs.TabPane;
import config from 'config';
import CustomTable from "widget/custom-table";
import parameterService from 'containers/setting/parameter-definition/parameter-definition.service'
import SlideFrame from 'widget/slide-frame'

class ParameterDefinition extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      data: [{id:1}],
      searchParams: {
        structureCode: "",
        structureName: ""
      },
      record: {},
      visible: false,
      nowTab: 0,
      tabs:[
        {
          key: 0, value: this.$t('parameter.definition.teat')
        },
        {
          key: 1, value: this.$t('parameter.definition.sob')
        },
        {
          key: 2, value: this.$t('parameter.definition.comp')
        },
      ],
      searchForm: [
        {
          type: 'select', id: 'structureCode', label: this.$t({id: 'parameter.definition.model'}),
          options: [],
          labelKey: 'itemTypeName',
          valueKey: 'id',
          listExtraParams: { organizationId: this.props.id },
          getUrl: `${config.baseUrl}/api/setOfBooks/by/tenant`,
          method: 'get',
          getParams: { roleType:'TENANT' },
        },
        {type: 'input', id: 'structureCode1', label: this.$t({id: 'budget.parameterCode'}) }, /*参数代码*/
        {type: 'input', id: 'structureName', label: this.$t({id: 'budget.parameterName'}) }, /*参数名称*/
      ],
      columns: [
        {          /*模块*/
          title: this.$t({id:"parameter.definition.model"}), key: "structureCodeg", dataIndex: 'structureCode',align:'center',
          render: desc => <Popover placement="topLeft" content={desc}>{desc||'-'}</Popover>
        },
        {          /*参数代码*/
          title: this.$t({id:"budget.parameterCode"}), key: "structureName", dataIndex: 'structureName', align:'center',
        },
        {          /*参数名称*/
          title: this.$t({id:"budget.parameterName"}), key: "structureName1", dataIndex: 'structureName', align:'center',
          render: desc => <Popover placement="topLeft" content={desc}>{desc||'-'}</Popover>
        },
        {          /*参数层级*/
          title: this.$t({id:"parameter.level"}), key: "periodStrategy", dataIndex: 'periodStrategy', align:"center",
        },
        {          /*参数值*/
          title: this.$t({id:"budget.balance.params.value"}), key: "value", dataIndex: 'periodStrategy', align:"center",
        },
        {           /*描述*/
          title: this.$t({id:"chooser.data.description"}), key: "description", dataIndex: 'description',align:"center",
          render: desc => <Popover placement="topLeft" content={desc}>{desc||'-'}</Popover>
        },
        {           /*操作*/
          title: this.$t({id:"common.operation" }),
          dataIndex: 'operation',
          align: 'center',
          render: (operation, record, index) => {
            return (
              <div>
                <a onClick={e=>this.handleEdit(e,record)} >{this.$t('common.edit')}</a>
                {
                  this.state.nowTab.toString() !== '0' &&
                    <span>
                      <Divider type="vertical" />
                      <Popconfirm title={this.$t('configuration.detail.tip.delete')} onConfirm={e => this.deleteItem(e, record)}>
                        <a>{this.$t('common.delete')}</a>
                      </Popconfirm>
                    </span>
                }

              </div>
            );
          }
        }
      ],
    }
  }
  componentDidMount(){
    //this.getList();
  }

  handleEdit = (e,record)=>{
    e.preventDefault();
    e.stopPropagation();
    console.log(record)
    this.setState({
      visible: true,
      record
    })
  };

  //获取预算表数据
  getList(){
    let params = Object.assign({}, this.state.searchParams);
    for(let paramsName in params){
      !params[paramsName] && delete params[paramsName];
    }
    this.setState({loading:true});
    params.organizationId = this.props.organization.id||this.props.id;
    params.page = this.state.pagination.page;
    params.size = this.state.pagination.pageSize;
    budgetService.getStructures(params).then((response)=>{
      response.data.map((item,index)=>{
        item.key = item.structureCode;
      });
      this.setState({
        data: response.data,
        pagination: {
          total: Number(response.headers['x-total-count']),
          current: this.state.pagination.current,
          page: this.state.pagination.page,
          pageSize:this.state.pagination.pageSize,
          showSizeChanger:true,
          showQuickJumper:true,
        },
        loading: false
      })
    })
  };

  handleSearch = (values) =>{
    let searchParams = {
      structureName: values.structureName,
      structureCode: values.structureCode
    };
    this.setState({
      searchParams:searchParams,
      page: 1
    }, ()=>{
      this.getList();
    })
  };

  //分页点击
  onChangePager = (pagination,filters, sorter) =>{
    let temp = this.state.pagination;
    temp.page = pagination.current-1;
    temp.current = pagination.current;
    temp.pageSize = pagination.pageSize;
    this.setState({
      loading: true,
      pagination: temp
    }, ()=>{
      this.getList();
    })
  };

 handleAdd = () =>{
   this.setState({visible: true})
 };

  //点击行，进入该行详情页面
  handleRowClick = (record, index, event) =>{
    console.log(this.props)
    this.props.dispatch(
      routerRedux.push({
        pathname: '/budget-setting/budget-organization/budget-organization-detail/budget-structure/budget-structure-detail/orgId/:setOfBooksId/:id'
          .replace(':orgId', this.props.organization.id)
          .replace(":setOfBooksId",this.props.setOfBooksId)
          .replace(':id', record.id)
      })
    );
  };

  handleClose = (params) =>{
    console.log(params)
    this.setState({
      visible: false
    })
  };

  renderContent(){
    const { searchForm, loading, data, columns, nowTab } = this.state;

    return(<div style={{marginTop: 15}}>
      <SearchArea searchForm={searchForm} submitHandle={this.handleSearch}/>
      <div className="table-header" style={{marginTop: 15}}>
        {
          nowTab.toString()!=='0'&&
          <div className="table-header-buttons">
            <Button type="primary" onClick={this.handleAdd}>{this.$t({id: 'common.add'})}</Button>  {/*添加*/}
          </div>
        }
      </div>
      <Table
        loading={loading}
        dataSource={data}
        columns={columns}
        size="middle"
        bordered/>
    </div>)
  }

  handleTab = (key)=>{
    const {searchForm, columns} = this.state;

    switch(key){
      case 1: {
        searchForm.slice(0,columns.length === 7 ? 0 : 1,{
          type: 'select', id: 'structureCode', label: this.$t({id: 'parameter.definition.model'}),
          options: [],
          labelKey: 'itemTypeName',
          valueKey: 'id',
          listExtraParams: { organizationId: this.props.id },
          getUrl: `${config.baseUrl}/api/setOfBooks/by/tenant`,
          method: 'get',
          getParams: { roleType:'TENANT',enabled: true },
        });
        columns.slice(0,columns.length === 7 ? 0 : 1,{
          title: this.$t({id:"form.setting.set.of.books"}), key: "sob", dataIndex: 'structureCode',align:'center',
          render: desc => <Popover placement="topLeft" content={desc}>{desc||'-'}</Popover>
        });
        break;
      }
      case 2: {
        searchForm.slice(0,columns.length === 7 ? 0 : 1,{
          type: 'select', id: 'structureCode', label: this.$t({id: 'parameter.definition.model'}),
          options: [],
          labelKey: 'itemTypeName',
          valueKey: 'id',
          listExtraParams: { organizationId: this.props.id },
          getUrl: `${config.baseUrl}/api/company/dto/by/tenant`,
          method: 'get',
          getParams: { roleType:'TENANT',enabled: true },
        });
        columns.slice(0,columns.length === 7 ? 0 : 1,{
          title: this.$t({id:"form.setting.set.of.books"}), key: "com", dataIndex: 'structureCode',align:'center',
          render: desc => <Popover placement="topLeft" content={desc}>{desc||'-'}</Popover>
        });
        break;
      }
    }

    this.setState({searchForm,nowTab: key})
  };

  render(){
    const {tabs, nowTab, visible, record} = this.state;
    return (
      <div className="parameter-definition">
        <Tabs onChange={this.handleTab} type='card'>
          {tabs.map(item=><TabPane tab={item.value} key={item.key}>{this.renderContent()}</TabPane>)}
        </Tabs>
        <SlideFrame
          title={tabs[nowTab].value+ this.$t('parameter.definition')}
          show={visible}
          onClose={()=>this.setState({visible: false})}>
          <NewParameterDefinition
            params={{...record,visible}}
            onClose={this.handleClose}
          />
        </SlideFrame>
      </div>
    )
  }

}

function mapStateToProps(state) {
  return {
    company: state.user.company
  }
}

export default connect(mapStateToProps, null, null, { withRef: true })(ParameterDefinition);