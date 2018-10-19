/**
 * Created by 13576 on 2018/1/14.
 */
import React from 'react'
import {connect} from 'react-redux'
import {Button, Table, Badge, Icon, Popconfirm, message, Input, Popover} from 'antd'
import SlideFrame from 'components/slide-frame'
import newUpDataLineModeRules from 'containers/financial-accounting-setting/accounting-source-system/new-updata-line-mode-rules'
import menuRoute from 'routes/menuRoute'
import accountingService from 'containers/financial-accounting-setting/accounting-source-system/accounting-source-system.service'
import {formatMessage} from 'share/common'

class LineModeRulesSystem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      dataVisible: false,
      searchText: "",
      filterDropdownVisible: false,
      data: [{id: 1}],
      setOfBooksId: null,
      lov: {
        visible: false,
        params: {
          lineModelId: this.props.params.lineModelId,
        }
      },
      journalLineModel: {},
      page: 0,
      pageSize: 10,
      searchParams: [],
      pagination: {
        total: 0,
      },
      searchForm: [
        {                                                                        //来源事物代码
          type: 'input', id: 'journalLineModelCode', label: formatMessage({id: 'accounting.source.code'})
        },
        {                                                                        //来源事物名称
          type: 'input', id: 'description', label: formatMessage({id: 'section.structure.name'})
        },
      ],

    };
  }


  componentWillMount() {
    this.getList();
    this.getLineMode();
    this.getSource();

  }

  //获取来源事务的账套
  getSource() {
    let sourceId = this.props.params.id;
    accountingService.getSourceTransactionbyID(sourceId).then((response) => {
      let data = response.data;
      this.setState({
        setOfBooksId: data.setOfBooksId,
      })
    })
  }


  getLineMode() {
    accountingService.getSourceTransactionModelbyID(this.props.params.lineModelId).then((response) => {
      this.setState({
        journalLineModel: response.data
      })
    })
  }


  getList(searchText) {
    this.setState({loading: true});
    let params = Object.assign({}, this.state.searchParams);
    for (let paramsName in params) {
      !params[paramsName] && delete params[paramsName];
    }
    params.page = this.state.page;
    params.size = this.state.pageSize;
    params.journalLineModelId = this.props.params.lineModelId;
    if (searchText) {
      params.journalFieldName = searchText;
    } else {
      params.journalFieldName = "";
    }
    accountingService.getSystemSourceLineModelRules(params).then((response) => {
      response.data.map((item, index) => {
        item.key = item.id;
      });
      this.setState({
        data: response.data,
        loading: false,
        pagination: {
          total: Number(response.headers['x-total-count']),
          onChange: this.onChangePager,
          pageSize: this.state.pageSize,
          current: this.state.page + 1
        }
      })
    }).catch(e => {
      message.error(`${e.response.data.message}`)
    });

  }

  handleSearch = (params) => {

  };

  //新建
  handleCreate = () => {
    let time = (new Date()).valueOf();
    let lov = {
      title:formatMessage({id: "accounting.source.newRule"}),
      visible: true,
      params: {
        isNew: true,
        sourceTransactionId: this.props.params.id,
        lineModelId: this.props.params.lineModelId,
        glSceneId: this.state.journalLineModel.glSceneId,
        setOfBooksId: this.state.setOfBooksId,
        journalLineModel: this.state.journalLineModel,
        time: time
      }
    };
    this.setState({
      lov
    })
  };

  //编辑
  handleUpdate = (e, record, index) => {
    let time = (new Date()).valueOf();
    let params = {
      record: record,
      isNew: false,
      sourceTransactionId: this.props.params.id,
      lineModelId: this.props.params.lineModelId,
      glSceneId: this.state.journalLineModel.glSceneId,
      setOfBooksId: this.state.setOfBooksId,
      journalLineModel: this.state.journalLineModel,
      time: time
    }
    let lov = {
      title:formatMessage({id: "accounting.source.editRule" }),
      visible: true,
      params: params
    };
    this.setState({
      lov
    })
  };

  handleAfterClose = (value) => {
    this.setState({
      lov: {
        visible: false
      }
    }, () => {
      if (value) {
        this.getList();
      }
    })
  };

  handleShowSlide = () => {
    this.setState({
      lov: {
        visible: false
      }
    })
  };

  //分页点击
  onChangePager = (page) => {
    if (page - 1 !== this.state.page)
      this.setState({
        page: page - 1,
        loading: true
      }, () => {
        this.getList();
      })
  };

  handleBack = () => {
    this.context.router.push(menuRoute.getMenuItemByAttr('accounting-source-system', 'key').children.voucherTemplate.url.replace(':id', this.props.params.id))
  };

  //取消添加凭证模板
  handleCancel = () => {
    this.setState({showListSelector: false})
  };


  onInputChange = (e) => {
    this.setState({searchText: e.target.value});
  }

  onSearch = () => {
    const {searchText} = this.state;
    this.setState({
      filterDropdownVisible: false,
    }, () => {
      this.getList(searchText)
    })
  }

  render() {
    const {loading, data, pagination, lov, journalLineModel} = this.state;
    let columns = [
      {
        /*核算分录段*/
        title: formatMessage({id:"accounting.source.journalFieldCode"}), key: "journalFieldName", dataIndex: 'journalFieldName',
        filterDropdown: (
          <div className="custom-filter-dropdown">
            <Input
              ref={ele => this.searchInput = ele}
              placeholder={formatMessage({id:"accounting.source.journalFieldCode"})}
              value={this.state.searchText}
              onChange={this.onInputChange}
              onPressEnter={this.onSearch}
            />
            <Button type="primary" onClick={this.onSearch}>Search</Button>
          </div>
        ),
        filterIcon: <Icon type="filter"/>,
        filterDropdownVisible: this.state.filterDropdownVisible,
        onFilterDropdownVisibleChange: (visible) => {
          this.setState({
            filterDropdownVisible: visible,
          }, () => this.searchInput && this.searchInput.focus());
        },
        render: recode => (
          <Popover content={recode}>
            {recode}
          </Popover>)
      },
      {
        /*取值方式*/
        title:formatMessage({id : "accounting.source.dataRule"}), key: "dataRuleName", dataIndex: 'dataRuleName',
        render: recode => (
          <Popover content={recode}>
            {recode}
          </Popover>)
      },
      {
        /*取值*/
        title: "取值", key: "data", tableField: 'data', width: '35%',
        render: (value, record) => {
            return (
              <div style={{whiteSpace: "normal"}}>
                <div>{record.dataRule == "ACCOUNT_ELEMENT" ? record.elementName : record.data?record.data:"-"}</div>
              </div>
            )

        }
      },
    /*  {
        /!*科目段值*!/
        title:formatMessage({id: "accounting.source.segment"}), key: "segmentName", dataIndex: 'segmentName',
        render: recode => (
          <Popover content={recode}>
            {recode}
          </Popover>)
      },*/
      {
        /*状态*/
        title: formatMessage({id: "common.column.status"}), key: 'status', width: '10%', dataIndex: 'enabled',
        render: enabled => (
          <Badge status={enabled ? 'success' : 'error'}
                 text={enabled ? formatMessage({id: "common.status.enable"}) : formatMessage({id: "common.status.disable"})}/>
        )
      },
      {
        title: formatMessage({id: "common.operation"}),
        key: 'operation',
        width: '8%',
        render: (text, record, index) => (
          <span>
            <a href="#" onClick={(e) => this.handleUpdate(e, record, index)}>{formatMessage({id: "common.edit"})}</a>
           </span>)
      },

    ]

    return (
      <div className="voucher-template">
        <div className="voucher-template-header">
          <h3>
            <span style={{marginLeft: "16px", size: "16px"}}>{formatMessage({id: "accounting.source.source"})}:{journalLineModel.sourceTransactionName}</span>
            <span style={{marginLeft: "16px", size: "16px"}}>{formatMessage({id: "accounting.source.mode"})}:{journalLineModel.journalLineModelCode}</span>
            <span style={{marginLeft: "16px", size: "16px"}}>{formatMessage({id: "accounting.source.scenarios"})}:{journalLineModel.glSceneName}</span>
          </h3>
        </div>

        <div className="table-header">
          <div
            className="table-header-title">{formatMessage({id: 'common.total'}, {total: `${pagination.total}`})}</div>
          {/*共搜索到*条数据*/}
          <div className="table-header-buttons">
            <Button type="primary" onClick={this.handleCreate}>{formatMessage({id: 'common.create'})}</Button> {/*新 建*/}
          </div>
        </div>
        <Table
          loading={loading}
          dataSource={data}
          columns={columns}
          pagination={pagination}
          rowKey={record => record.id}
          bordered
          size="middle"/>
        <a style={{fontSize: '14px', paddingBottom: '20px'}} onClick={this.handleBack}><Icon type="rollback"
                                                                                             style={{marginRight: '5px'}}/>{formatMessage({id: "common.back"})}
        </a>
        <SlideFrame title={lov.title}
                    show={lov.visible}
                    content={newUpDataLineModeRules}
                    afterClose={this.handleAfterClose}
                    onClose={() => this.handleShowSlide(false)}
                    params={lov.params}/>
      </div>
    )
  }
}


LineModeRulesSystem.contextTypes = {
  router: React.PropTypes.object
};

function mapStateToProps(state) {
  return {}
}

export default connect(mapStateToProps, null, null, { withRef: true })(LineModeRulesSystem);