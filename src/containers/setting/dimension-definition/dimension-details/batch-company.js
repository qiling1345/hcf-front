
import React, { Component } from 'react';
import { Row, Col, Badge, Button, Icon, Checkbox, message} from 'antd';
import SlideFrame from 'widget/slide-frame';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import Table from 'widget/table';
import ListSelector from 'components/Widget/list-selector';
import AddCompanyForm from './new-company-form';
import config from 'config';
import dimensionValueService from './dimension-value-service';

class BatchSingleCompany extends Component {
    constructor(props) {
      super(props);
      this.state = {
        //setOfBooksId:缺失
        //当前维值的数据
        curTypeList: {},
        dimensionItemId: this.props.match.params.dimensionItemId,
        page: 0,
        size: 10,
        pagination: {
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: total => `一共${total}条数据`
        },
        columns: [
          { title: '公司代码', dataIndex: 'companyCode',align:'center' },
          { title: '公司名称', dataIndex: 'companyName',align:'center' },
          { title: '公司类型', dataIndex: 'companyType',align:'center' },
          {
            title: '启用',
            dataIndex: 'enabled',align:'center',
            render: (enabled, record, index) => {
              return <Checkbox checked={enabled} onChange={e => this.onIsEnabledChange(e, record)} />;
            },
          },
        ],
        isLoading: false,
        //table表dataSource
        companyData: [],
        //公司模态框可见
        companyVisible: false,
        //公司模态框样式
        selectorItem: {
          title: "批量分配公司",
          url: `${config.baseUrl}/api/refactor/companies/user/setOfBooks`,
          searchForm: [
            { type: 'input', id: 'companyCode', label: '公司代码' },
            { type: 'input', id: 'name', label: '公司名称' },
            { type: 'input', id: 'companyCodeFrom', label: '公司代码从' },
            { type: 'input', id: 'companyCodeTo', label: '公司代码至' }
          ],
          columns: [
            { title: '公司代码', dataIndex: 'companyCode' },
            { title: '公司名称', dataIndex: 'name' },
            { title: '公司类型', dataIndex: 'companyTypeName', render: value => value ? value : '-' },
          ],
          key: 'id'
        },
        //新增模态框可见
        isVisibleForFrame: false,
        //新增公司数据
        modelData: [],
      }
    }

    componentDidMount = () => {
       this.getCompanyData();
       this.getCurDimensionValue();
       console.log(this.state.dimensionItemId);
    }

    //获取当前维值详情
    getCurDimensionValue = () => {
      dimensionValueService
        .getCurrentDimensionValue(this.state.dimensionItemId)
        .then(res => {
            console.log(res);
            this.setState({
              curTypeList: {...res.data['dimensionItem']},
            });
        })
        .catch(err => {
           console.log(err);
           message.error('查询详情失败:'+err.response.data.message);
        });
    }
    //获取公司数据
    getCompanyData = () => {
        const {page, size, dimensionItemId, pagination} = this.state;
        let params = {page,size,dimensionItemId};
        this.setState({isLoading: true});
        dimensionValueService.getCompanyList(params)
          .then(res => {
             pagination.total = Number(res.headers['x-total-count']);
             this.setState({
               companyData: res.data,
               isLoading: false,
               pagination
             });
          })
          .catch(err => {
              this.setState({isLoading: false});
              message.error("获取公司数据失败"+err);
          });
    }

    //新增公司
    addCompany = () => {
       this.setState({isVisibleForFrame: true});
    }

    //关闭模态框
    closeFormModal = (flag) => {
      this.setState({
          isVisibleForFrame: false,
          modelData: {}
      },() => {
          if(flag) {
            this.getCompanyData();
          }
      });
    }

     //分页
     tablePageChange = (pagination) => {
      this.setState({
        page: pagination.current - 1,
        size: pagination.pageSize || 10
      }, () => {
        this.getDetailsValue();
      })
    }

    //返回上一页
    onBackClick = e => {
      e.preventDefault();
      this.setState({
         curTypeList: {},
         dimensionItemId: null
      });
      this.props.dispatch(
        routerRedux.replace({
          pathname: `/admin-setting/dimension-definition/dimension-details`,
        })
      );
    }

    //是否启用
    onIsEnabledChange = (e, record) => {
      let params = [];
      params.push({
        id: record.id,
        enabled: e.target.checked,
      });
      dimensionValueService
        .toEnableTheCompany(params)
        .then(res => {
           this.getCompanyData();
           message.success('修改状态成功');
        })
        .catch(err => {
           message.error(err.response.data.message);
        });
    };

    //批量分配公司
    handleBatch = () => {
        this.setState({companyVisible: true});
    }
    onCompanyCancel = () => {
        this.setState({companyVisible: false});
    }
    onCompanyOk = value => {
        const params = [];
        value.result.map( item => {
            params.push({
               companyId: item.id,
               companyCode: item.code,
               enabled: item.enabled,
               dimensionItemId: this.state.dimensionItemId
            });
        });
        console.log(params);
        dimensionValueService
          .addNewCompanyData(params)
          .then(res => {
              message.success('创建成功');
              this.getCompanyData();
              this.setState({
                companyVisible: false,
                selectedRowKeys: []
              });
          })
          .catch(err => {
              this.setState({
                companyVisible: false,
                selectedRowKeys: []
              });
              message.error(err.response.data.message);
          })
    }

    render() {
       const {
          curTypeList,
          pagination,
          columns,
          isLoading,
          companyData,
          companyVisible,
          selectorItem,
          dimensionItemId,
          modelData,
          isVisibleForFrame} = this.state;
       return(
          <div>
            <h1 style={{padding: '14px 0', borderBottom: '1px solid #c9c9c9'}}>基本信息</h1>
            <div>
            <Row
              gutter={24}
              type="flex"
              justify="start"
              style={{ background: '#f7f7f7', padding: '20px 25px 0', borderRadius: '6px 6px 0 0' }}>
                  <Col span={8} style={{ marginBottom: '15px' }}>
                  <div style={{ color: '#989898' }}>维值代码</div>
                  <div style={{ wordWrap: 'break-word' }}>
                      {curTypeList.dimensionItemCode}
                  </div>
                </Col>
                <Col span={8} style={{ marginBottom: '15px' }}>
                  <div style={{ color: '#989898' }}>维值名称</div>
                  <div style={{ wordWrap: 'break-word' }}>
                      {curTypeList.dimensionItemName}
                  </div>
                </Col>
                <Col span={8} style={{ marginBottom: '15px' }}>
                  <div style={{ color: '#989898' }}>状态</div>
                  <div style={{ wordWrap: 'break-word' }}>
                    <Badge
                      status={curTypeList.enabled ? 'success' : 'error'}
                      text={curTypeList.enabled ? '启用' : '禁用'}
                    />
                  </div>
                </Col>
              </Row>
            </div>
            <Button
              type='primary'
              style={{marginBottom: '10px'}}
              onClick={this.handleBatch}>批量分配公司</Button>
            <Button
              type='primary'
              style={{margin: '0 0 10px 10px'}}
              onClick={this.addCompany}>新增公司</Button>
            <Table
              columns={columns}
              pagination={pagination}
              loading={isLoading}
              dataSource={companyData}
              size="middle"
              bordered
              rowKey={record => record.id}
              onChange={this.tablePageChange} />
            <div>
              <a onClick={this.onBackClick}>
                <Icon type="rollback" />返回
              </a>
            </div>
            <ListSelector
              visible={companyVisible}
              onCancel={this.onCompanyCancel}
              onOk={this.onCompanyOk}
              selectorItem={selectorItem}
              extraParams={{setOfBooksId:1,page: 0,size: 10}}
              single={false}
            />
            <SlideFrame
              title='新增公司信息'
              show={isVisibleForFrame}
              onClose={() => {
                this.setState({ isVisibleForFrame: false }, () => {
                  this.setState({modelData: {}});
                })
            }}>
              <AddCompanyForm
                params={modelData}
                itemId={dimensionItemId}
                close={this.closeFormModal}/>
          </SlideFrame>
          </div>
       )
    }
}


export default connect(
  null,
  null,
  null,
  { withRef: true }
)(BatchSingleCompany);
