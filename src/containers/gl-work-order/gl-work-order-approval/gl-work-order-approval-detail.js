import React, { Component } from 'react';
import { connect } from 'dva';
import config from 'config';
import {
  Button,
  Affix,
  message,
  Row,
  Col,
  Icon,
  Input,
  Tabs,
  Table,
  Divider,
  InputNumber,
  Popover,
} from 'antd';
const TabPane = Tabs.TabPane;
// import menuRoute from 'routes/menuRoute'
import myGlWorkOrderService from 'containers/gl-work-order/my-gl-work-order/my-gl-work-order.service';
import moment from 'moment';
import DocumentBasicInfo from 'widget/document-basic-info';
import 'styles/gl-work-order/my-gl-work-order/my-gl-work-order-detail.scss';
import ApproveHistory from 'containers/pre-payment/my-pre-payment/approve-history-work-flow';
import glWorkOrderCheckService from 'containers/gl-work-order/gl-work-order-approval/gl-work-order-approval.service';
class GLWorkOrderCheckDetail extends Component {
  /**
   * 构造函数
   */
  constructor(props) {
    super(props);
    this.state = {
      //传给单据头组件的数据
      headerInfo: {},
      //单据头信息
      docHeadData: {},
      //维度信息
      dimensionData: [],
      //记录当前编辑的行有哪些
      editLines: [],
      /**
       * 审批历史
       */
      historyLoading: true,
      approveHistory: [],
      //表格宽度
      tableWidth: 850,
      //审批
      opinion: '',
      operateLoading: false,
      /**
       * 单据行
       * lineStatus有三种状态：
       * 普通：normal
       * 编辑：edit
       * 新建：insert
       */
      columns: [
        {
          title: '序号',
          dataIndex: 'seq',
          align: 'center',
          width: '60',
          render: (seq, record, index) => {
            return <span>{index + 1}</span>;
          },
        },
        {
          title: '备注',
          dataIndex: 'description',
          align: 'center',
          width: '130',
          render: (description, record, index) => {
            return (
              <Popover content={description}>
                <span>{description}</span>
              </Popover>
            );
          },
        },
        {
          title: '公司',
          dataIndex: 'companyName',
          align: 'center',
          width: '140',
          render: (companyName, record, index) => {
            return <span>{companyName}</span>;
          },
        },
        {
          title: '部门',
          dataIndex: 'unitName',
          align: 'center',
          width: '140',
          render: (unitName, record, index) => {
            return <span>{unitName}</span>;
          },
        },
        {
          title: '科目',
          dataIndex: 'accountName',
          align: 'center',
          width: '130',
          render: (accountName, record, index) => {
            return <span>{accountName}</span>;
          },
        },
        {
          title: '借方金额',
          dataIndex: 'enteredAmountCr',
          align: 'center',
          width: '130',
          fixed: 'right',
          render: (enteredAmountCr, record, index) => {
            return <span>{this.filterMoney(enteredAmountCr, 2)}</span>;
          },
        },
        {
          title: '贷方金额',
          dataIndex: 'enteredAmountDr',
          align: 'center',
          width: '130',
          fixed: 'right',
          render: (enteredAmountDr, record, index) => {
            return <span>{this.filterMoney(enteredAmountDr, 2)}</span>;
          },
        },
      ],
      loading: true,
      pagination: {
        total: 0,
        showSizeChanger: true,
        showQuickJumper: true,
      },
      data: [],
      page: 0,
      pageSize: 10,
    };
  }
  /**
   * 生命周期函数
   */
  componentWillMount = () => {
    this.getDocInfoById();
    this.getHistory();
  };
  /**
   * 获取审批历史
   */
  getHistory = () => {
    let documentOid = this.props.params.oid;
    myGlWorkOrderService
      .getHistory(documentOid)
      .then(res => {
        if (res.status === 200) {
          this.setState({
            historyLoading: false,
            approveHistory: res.data,
          });
        }
      })
      .catch(e => {
        console.log(`加载审批历史数据失败：${e}`);
        if (e.response) {
          message.error(`加载审批历史数据失败：${e.response.data.message}`);
        }
        this.setState({ historyLoading: false });
      });
  };
  /**
   * 根据头id获取单据数据-初始化的时候
   */
  getDocInfoById = () => {
    let headId = this.props.params.id;
    let page = this.state.page;
    let size = this.state.pageSize;
    myGlWorkOrderService
      .getHeaderData(headId, page, size)
      .then(res => {
        if (res.status === 200) {
          let docHeadData = res.data.head;
          let data = res.data.line;
          let dimensionData = res.data.dimensions;
          let headerInfo = {
            businessCode: docHeadData.workOrderNumber,
            createdDate: docHeadData.requisitionDate,
            formName: docHeadData.typeName,
            createByName: docHeadData.createByName,
            currencyCode: docHeadData.currency,
            totalAmount: docHeadData.amount,
            statusCode: docHeadData.status,
            remark: docHeadData.remark,
            infoList: [
              { label: '申请人', value: docHeadData.employeeName },
              { label: '公司', value: docHeadData.companyName },
              { label: '部门', value: docHeadData.unitName },
            ],
            attachments: docHeadData.attachments,
          };
          this.setState(
            {
              docHeadData,
              headerInfo,
              dimensionData,
              data,
              loading: false,
              pagination: {
                total: Number(res.headers['x-total-count'])
                  ? Number(res.headers['x-total-count'])
                  : 0,
                current: page + 1,
                onChange: this.onChangeCheckedPage,
                onShowSizeChange: this.onShowSizeChange,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: total => `共搜到 ${total} 条数据`,
              },
            },
            () => {
              this.addDimensionColumns(dimensionData);
            }
          );
        }
      })
      .catch(e => {
        console.log(`获取单据信息失败：${e}`);
        if (e.response) {
          message.error(`获取单据信息失败：${e.response.data.message}`);
        }
        this.setState({
          loading: false,
        });
      });
  };
  /**
   * 切换分页
   */
  onChangeCheckedPage = page => {
    if (page - 1 !== this.state.page) {
      this.setState(
        {
          loading: true,
          page: page - 1,
        },
        () => {
          this.getDocInfoById();
        }
      );
    }
  };
  /**
   * 切换每页显示的条数
   */
  onShowSizeChange = (current, pageSize) => {
    this.setState(
      {
        loading: true,
        page: current - 1,
        pageSize,
      },
      () => {
        this.getDocInfoById();
      }
    );
  };
  /**
   * 实现动态添加维度列
   */
  addDimensionColumns = dimensionData => {
    let { columns, tableWidth } = this.state;
    if (columns.length <= 7) {
      dimensionData.map(item => {
        //根据维度个数调整列宽
        tableWidth += 130;
        //维度id
        let dimensionId = item.id;
        //维度name
        let dimensionTitle = item.name;
        //维值id-字段名称
        let dimensionKey = 'dimensionValue' + item.priority + 'Id';
        //维值name-字段名称
        let dimensionName = 'dimensionValue' + item.priority + 'Name';
        //拼接列
        let dimensionColumn = {
          title: dimensionTitle,
          dataIndex: dimensionKey,
          align: 'center',
          render: (text, record, index) => {
            return <span>{record[dimensionName]}</span>;
          },
        };
        columns.splice(5, 0, dimensionColumn);
        this.setState({
          columns,
          tableWidth,
        });
      });
    }
  };
  /**
   * 返回
   */
  onBack = () => {
    // this.context.router.push(menuRoute.getRouteItem('gl-work-order-check', 'key').url);
  };
  /**
   * 修改审批意见
   */
  onOpinionChange = e => {
    this.setState({ opinion: e.target.value });
  };
  /**
   * 审批通过
   */
  onPassClick = () => {
    this.setState({ operateLoading: true });
    let params = {
      approvalTxt: this.state.opinion,
      entities: [
        {
          entityOID: this.state.docHeadData.documentOid,
          entityType: 801008,
        },
      ],
      countersignApproverOIDs: [],
    };
    glWorkOrderCheckService
      .pass(params)
      .then(res => {
        if (res.status === 200) {
          message.success('操作成功');
          this.setState({ operateLoading: false });
          this.onBack();
        }
      })
      .catch(e => {
        console.log(`审批通过失败：${e}`);
        if (e.response) {
          message.error(`操作失败：${e.response.data.message}`);
        }
        this.setState({ operateLoading: false });
      });
  };
  /**
   * 审批驳回
   */
  onRejectClick = () => {
    this.setState({ operateLoading: true });
    if (!this.state.opinion) {
      message.error('请输入审批意见');
      this.setState({ operateLoading: false });
      return;
    }
    let params = {
      approvalTxt: this.state.opinion,
      entities: [
        {
          entityOID: this.state.docHeadData.documentOid,
          entityType: 801008,
        },
      ],
    };
    glWorkOrderCheckService
      .reject(params)
      .then(res => {
        if (res.status === 200) {
          message.success('操作成功');
          this.setState({ operateLoading: false });
          this.onBack();
        }
      })
      .catch(e => {
        console.log(`审批驳回失败：${e}`);
        if (e.response) {
          message.error(`操作失败:${e.response.data.message}`);
        }
        this.setState({ operateLoading: false });
      });
  };
  /**
   * 渲染函数
   */
  render() {
    //传给头组件的data
    const { headerInfo } = this.state;
    //头行数据
    const { docHeadData } = this.state;
    //审批历史
    const { approveHistory, historyLoading } = this.state;
    //表格
    let { columns, loading, pagination, data, tableWidth } = this.state;
    //审批
    let { opinion, operateLoading } = this.state;
    //单据状态
    let docStatus = this.props.params.status;
    //真正渲染出来的东东
    return (
      <div className="gl-work-order-detail background-transparent">
        <div className="top-info" style={{ padding: '40px 20px 20px 20px' }}>
          <Tabs defaultActiveKey="1" onChange={this.tabChange} forceRender>
            <TabPane tab="单据信息" key="1">
              <DocumentBasicInfo params={headerInfo} />
            </TabPane>
            {/* <TabPane tab="凭证信息" key="2"></TabPane> */}
          </Tabs>
        </div>
        <div className="tab-container">
          <h3 className="sub-header-title">付款信息</h3>
          <Table
            style={{ clear: 'both' }}
            bordered
            size="middle"
            rowKey={record => record['id']}
            loading={loading}
            columns={columns}
            pagination={pagination}
            dataSource={data}
            scroll={{ x: tableWidth }}
          />
        </div>
        <div style={{ paddingBottom: 10 }}>
          <ApproveHistory loading={historyLoading} infoData={approveHistory} />
        </div>
        {(docStatus &&
          docStatus === '1002' && (
            <Affix className="bottom-bar" offsetBottom="0">
              <Row gutter={12} type="flex" justify="start">
                <Col offset={1}>
                  <label>审批意见：</label>
                </Col>
                <Col span={11}>
                  <Input
                    placeholder="请输入，最多200个字符"
                    value={opinion}
                    onChange={this.onOpinionChange}
                  />
                </Col>
                <Col span={1.5}>
                  <Button loading={operateLoading} type="primary" onClick={this.onPassClick}>
                    通过
                  </Button>
                </Col>
                <Col span={1.5}>
                  <Button
                    loading={operateLoading}
                    onClick={this.onRejectClick}
                    style={{ background: '#F00000', color: 'white' }}
                    type="danger"
                  >
                    驳回
                  </Button>
                </Col>
                <Col span={3} offset={1}>
                  <Button loading={operateLoading} onClick={this.onBack}>
                    返回
                  </Button>
                </Col>
              </Row>
            </Affix>
          )) ||
          (docStatus &&
            docStatus === '1004' && (
              <Affix className="bottom-bar" offsetBottom="0">
                <Row gutter={12} type="flex" justify="start">
                  <Col span={3} offset={1}>
                    <Button onClick={this.onBack}>返回</Button>
                  </Col>
                </Row>
              </Affix>
            ))}
      </div>
    );
  }
}
// GLWorkOrderCheckDetail.contextTypes = {
//     router: React.PropTypes.object
// };
function mapStateToProps(state) {
  return {
    company: state.user.company,
    user: state.user.currentUser,
  };
}
export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(GLWorkOrderCheckDetail);
