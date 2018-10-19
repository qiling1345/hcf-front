import React from 'react'
import { connect } from 'react-redux'
import {formatMessage} from 'share/common'
import { Button, Table, Badge, Popover } from 'antd'

import SearchArea from 'components/search-area'
import menuRoute from 'routes/menuRoute'
import httpFetch from 'share/httpFetch'
import config from 'config'

class BudgetStrategy extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      searchForm: [
        {type: 'input', id: 'controlStrategyCode', label: formatMessage({id: "budget.strategy.code"}/*预算控制策略代码*/)},
        {type: 'input', id: 'controlStrategyName', label: formatMessage({id: "budget.strategy.name"}/*预算控制策略名称*/)}
      ],
      searchParams: {
        controlStrategyCode: "",
        controlStrategyName: ""
      },
      columns: [
        {title: formatMessage({id: "budget.strategy.code"}/*预算控制策略代码*/), dataIndex: 'controlStrategyCode', key: 'controlStrategyCode'},
        {title: formatMessage({id: "budget.strategy.name"}/*预算控制策略名称*/), dataIndex: 'controlStrategyName', key: 'controlStrategyName',
          render: desc => <Popover placement="topLeft" content={desc}>{desc}</Popover>},
        {title: formatMessage({id: "common.column.status"}/*状态*/), dataIndex: 'enabled', key: 'enabled', width: '10%', render: enabled =>
          <Badge status={enabled ? 'success' : 'error'}
                 text={enabled ? formatMessage({id: "common.status.enable"}/*启用*/) : formatMessage({id: "common.status.disable"}/*禁用*/)} />}
      ],
      data: [],    //列表值
      pagination: {
        total: 0
      },
      page: 0,
      pageSize: 10,
      newBudgetStrategy:  menuRoute.getRouteItem('new-budget-strategy','key'),    //新建控制策略
      budgetStrategyDetail:  menuRoute.getRouteItem('budget-strategy-detail','key'),    //预算控制策略详情
    };
  }

  componentWillMount(){
    this.getList();
  }

  //分页点击
  onChangePager = (page) => {
    if(page - 1 !== this.state.page)
      this.setState({ page: page - 1 }, ()=>{
        this.getList();
      })
  };

  getList() {
    let params = this.state.searchParams;
    let url = `${config.budgetUrl}/api/budget/control/strategies/query?size=${this.state.pageSize}&page=${this.state.page}&organizationId=${this.props.id}`;
    for(let paramsName in params){
      url += params[paramsName] ? `&${paramsName}=${params[paramsName]}` : '';
    }
    this.setState({ loading: true });
    return httpFetch.get(url).then((response)=>{
      if(response.status === 200){
        response.data.map((item, index)=>{
          item.index = this.state.page * this.state.pageSize + index + 1;
          item.key = item.index;
        });
        this.setState({
          data: response.data,
          loading: false,
          pagination: {
            total: Number(response.headers['x-total-count']),
            onChange: this.onChangePager,
            current: this.state.page + 1
          }
        })
      }
    }).catch((e)=>{

    })
  }

  //搜索
  search = (result) => {
    let searchParams = {
      controlStrategyCode: result.controlStrategyCode,
      controlStrategyName: result.controlStrategyName
    };
    this.setState({
      searchParams:searchParams,
      loading: true,
      page: 0,
      pagination: {
        current: 1
      }
    }, ()=>{
      this.getList();
    })
  };

  //清空搜索区域
  clear = () => {
    this.setState({searchParams: {
      controlStrategyCode: "",
      controlStrategyName: ""
    }})
  };

  handleNew = () => {
    this.context.router.push(this.state.newBudgetStrategy.url.replace(':id', this.props.organization.id).replace(":setOfBooksId",this.props.setOfBooksId));
  };

  handleRowClick = (record) => {
    this.context.router.push(this.state.budgetStrategyDetail.url.replace(':id', this.props.organization.id).replace(':strategyId', record.id).replace(":setOfBooksId",this.props.setOfBooksId));
  };

  render(){
    const { searchForm, columns, data, pagination, loading } = this.state;
    return (
      <div className="budget-strategy">
        <SearchArea
          searchForm={searchForm}
          submitHandle={this.search}
          clearHandle={this.clear}/>
        <div className="table-header">
          <div className="table-header-title">{formatMessage({id: "common.total"},{total:`${pagination.total || 0}`}/*共搜索到 {total} 条数据*/)}</div>
          <div className="table-header-buttons">
            <Button type="primary" onClick={this.handleNew}>{formatMessage({id: "common.create"}/*新建*/)}</Button>
          </div>
        </div>
        <Table columns={columns}
               dataSource={data}
               pagination={pagination}
               loading={loading}
               onRow={record => ({
                 onClick: () => this.handleRowClick(record)
               })}
               bordered
               size="middle"/>
      </div>
    )
  }

}

BudgetStrategy.contextTypes = {
  router: React.PropTypes.object
};

function mapStateToProps() {
  return {}
}

export default connect(mapStateToProps, null, null, { withRef: true })(BudgetStrategy);