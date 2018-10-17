import React from 'react'
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import menuRoute from 'routes/menuRoute'
import { Form, Input, Affix, Button } from 'antd'
const FormItem = Form.Item;

import requestService from 'containers/request/request.service'
import 'styles/request/new-request.scss'

class NewRequest extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      formInfo: {},
      applicationList: menuRoute.getRouteItem('request','key'), //申请单列表页
    }
  }

  componentWillMount() {
    this.getFormInfo()
  }

  //获取表单配置
  getFormInfo = () => {
    requestService.getCustomForm(this.props.params.formOID).then(res => {
      this.setState({ formInfo: res.data })
    })
  };

  //返回
  goBack = () => {
    this.context.router.push(this.state.applicationList.url)
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { formInfo } = this.state;
    const customFormFields = formInfo.customFormFields || [];
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14, offset: 1 },
    };
    return (
      <div className="new-request">
        <h3 className="header-title">新建{formInfo.formName}</h3>
        <Form className="form-container">
          {customFormFields.map(field => {
            return (
              <FormItem {...formItemLayout} label={field.fieldName} key={field.messageKey}>
                {getFieldDecorator(field.messageKey)(
                  <Input />
                )}
              </FormItem>
            )
          })}

        </Form>
        <Affix offsetBottom={0} className="bottom-bar">
          <Button type="primary">提交</Button>
          <Button>保存</Button>
          <Button onClick={this.goBack}>返回</Button>
        </Affix>
      </div>
    )
  }
}

NewRequest.contextTypes = {
  router: React.PropTypes.object
};

function mapStateToProps() {
  return { }
}

const wrappedNewRequest = Form.create()(injectIntl(NewRequest));

export default connect(mapStateToProps, null, null, { withRef: true })(wrappedNewRequest)