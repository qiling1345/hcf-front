import {messages} from "share/common";
/**
 * 操作：更改
 * 适用：已通过 且 customFormPropertyMap['application.change.enable']为true 的 差旅申请单
 * 获取 customFormPropertyMap 的接口：/api/custom/forms/
 */
import React from 'react'
import { connect } from 'react-redux'
import menuRoute from 'routes/menuRoute'
import { Form, Button, message } from 'antd'

import requestService from 'containers/request/request.service'

class TravelUpdateBtn extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      requestEdit: menuRoute.getRouteItem('request-edit','key'), //申请单编辑页
    }
  }

  //判断是否可以更改
  judgeEnable = () => {
    this.setState({ loading: true });
    requestService.judgeEnableChange(this.props.info.applicationOID).then(res => {
      if (res.data.success) {
        this.handleUpload()
      } else {
        this.setState({ loading: false });
        message.warning(res.data.message)
      }
    })
  };

  //更改
  handleUpload = () => {
    const { formOID, applicationOID } = this.props.info;
    let info = this.props.info;
    info.applicationOID = '';
    requestService.handleApplicationUpload(applicationOID, info).then(res => {
      this.context.router.replace(this.state.requestEdit.url.replace(':formOID', formOID).replace(':applicationOID', res.data.applicationOID))
    }).catch(e => {
      this.setState({ loading: false });
      message.warning(e.response.data.message)
    })
  };

  render() {
    const { loading } = this.state;
    const { formType, info, updateEnable } = this.props;
    return (
      <div className="travel-update-btn request-btn">
        {/* status: 1003（已通过）、1011（已更改） */}
        {formType === 2001 && info.status === 1003 && updateEnable === 'true' && (
          <Button type="primary" loading={loading} onClick={this.judgeEnable}>{messages('request.detail.btn.modify')/*更 改*/}</Button>
        )}
      </div>
    )
  }
}

TravelUpdateBtn.propTypes = {
  formType: React.PropTypes.number.isRequired,
  info: React.PropTypes.object.isRequired,
  updateEnable: React.PropTypes.string
};

TravelUpdateBtn.contextTypes = {
  router: React.PropTypes.object
};

function mapStateToProps() {
  return { }
}

const wrappedTravelUpdateBtn = Form.create()(TravelUpdateBtn);

export default connect(mapStateToProps, null, null, { withRef: true })(wrappedTravelUpdateBtn)