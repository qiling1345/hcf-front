import React from 'react';

import { connect } from 'react-redux';
import { Form, Modal, Button } from 'antd';
import proxiesService from 'components/template/proxies/proxies-service';

import Selector from 'components/selector';

const FormItem = Form.Item;
import menuRoute from 'routes/menuRoute';

class Proxies extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isShowProxyButton: false,
      isShowProxyModal: false,
    };
  }

  componentWillMount() {
    this.getIsProxyCustomForm();
  }

  //是否有代替
  getIsProxyCustomForm() {
    proxiesService.getIsProxyCustomForm(this.props.formType).then(res => {
      this.setState({ isShowProxyButton: res.data });
    });
  }

  //是否为报销单
  isExpenseReport() {
    const { formType } = this.props;
    return formType === '102';
  }

  //申请人改变
  changeAgent = value => {
    this.setState({ userOID: value }, () => {
      this.props.form.resetFields(['formOID']);
    });
  };
  //取消弹框
  modalControl = flag => {
    this.setState({
      isShowProxyModal: flag,
    });
  };
  //确认单据
  onOK = () => {
    let { validateFieldsAndScroll, getFieldValue } = this.props.form;
    validateFieldsAndScroll((err, value) => {
      if (!err) {
        let menuKey = this.isExpenseReport() ? 'new-expense-report' : 'new-request';
        this.context.router.push(
          menuRoute
            .getRouteItem(menuKey)
            .url.replace(':formId', getFieldValue('formOID'))
            .replace(':userOID', getFieldValue('agent'))
            .replace(':formOID', getFieldValue('formOID'))
        );
        this.modalControl(false);
      }
    });
  };

  render() {
    const { formType } = this.props;
    const { getFieldDecorator, getFieldValue } = this.props.form;
    const { isShowProxyButton, isShowProxyModal, userOID } = this.state;
    let formParam = {
      formType: formType,
    };
    if (isShowProxyModal) {
      formParam.userOID = userOID;
    }
    let buttonContentKey = this.isExpenseReport()
      ? 'components.template.proxies-proxy-exportButton'
      : 'components.template.proxies-proxy-applyButton'; //代理报销单#代理申请单
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14, offset: 1 },
    };
    return (
      <span>
        {isShowProxyButton && (
          <Button onClick={() => this.modalControl(true)}>{this.$t(buttonContentKey)}</Button>
        )}
        <Modal
          title={this.$t(buttonContentKey)}
          onCancel={() => this.modalControl(false)}
          onOk={this.onOK}
          visible={isShowProxyModal}
        >
          <Form>
            <FormItem {...formItemLayout} label={this.$t('common.applicant') /*申请人*/}>
              {getFieldDecorator('agent', {
                rules: [
                  {
                    required: true,
                    message: this.$t('common.please.select') /*请选择*/,
                  },
                ],
              })(
                <Selector
                  showSearch={true}
                  onChange={this.changeAgent}
                  placeholder={this.$t('common.please.select') /*'请输入选择'*/}
                  type={'agent'}
                  params={{ formType: formType }}
                />
              )}
            </FormItem>
            {formParam.userOID && (
              <FormItem {...formItemLayout} label={this.$t('common.document.name') /*单据名称*/}>
                {getFieldDecorator('formOID', {
                  rules: [
                    {
                      required: true,
                      message: this.$t('common.please.select') /*请选择*/,
                    },
                  ],
                })(
                  <Selector
                    showSearch={true}
                    type={'proxyForm'}
                    placeholder={this.$t('common.please.select') /*'请输入选择'*/}
                    params={formParam}
                  />
                )}
              </FormItem>
            )}
          </Form>
        </Modal>
      </span>
    );
  }
}

Proxies.propTypes = {
  formType: React.PropTypes.string, //代理单据类型102.报销单；101.申请单
};
Proxies.defaultProps = {
  formType: '102',
};
Proxies.contextTypes = {
  router: React.PropTypes.object,
};
const WrappedProxies = Form.create()(Proxies);

function mapStateToProps(state) {
  return {};
}

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(WrappedProxies);