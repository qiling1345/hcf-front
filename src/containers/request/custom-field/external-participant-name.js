import {messages} from "share/common";
import React from 'react'
import { connect } from 'react-redux'
import { Form, Button, Modal, Table, Popover } from 'antd'

import 'styles/request/custom-field/external-participant-name.scss'

class ExternalParticipantName extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      columns: [{title: messages('customField.name'/*姓名*/), dataIndex: 'name', render: value => <Popover content={value}>{value}</Popover>}],
    }
  }

  componentDidMount() {
    let columns = this.state.columns;
    if (this.props.value[0].certificateNo) {
      columns.push({title: messages('customField.id.number'/*证件号*/), dataIndex: 'certificateNo', render: value => <Popover content={value}>{value}</Popover>})
    }
    this.setState({ columns })
  }

  render() {
    const { field, value } = this.props;
    const { visible, columns } = this.state;
    return (
      <div className="external-participant-name">
        <div>
          {value.map((item, index) => {
            return item.name && <span style={{marginRight:10}} key={index}>{item.name}{index < value.length - 1 ? ', ' : ''}</span>
          })}
          <a onClick={() => {this.setState({ visible: true })}}>{messages('common.view')}</a>
        </div>
        <div className="modal-container"/>
        <Modal title={field.fieldName}
               visible={visible}
               getContainer={() => document.getElementsByClassName('modal-container')[0]}
               footer={<Button onClick={() => {this.setState({ visible: false })}}>{messages('request.detail.loan.close')/*关闭*/}</Button>}
               onCancel={() => {this.setState({ visible: false })}}>
          <div className="table-header">
            <div className="table-header-title">{messages('common.total1', {total: value.length})}</div>
          </div>
          <div className="booking-manager-table">
            <Table rowKey={(record, index) => index}
                   columns={columns}
                   dataSource={value}
                   pagination={false}
                   size="middle"
                   bordered />
          </div>
        </Modal>
      </div>
    )
  }
}

ExternalParticipantName.propTypes = {
  field: React.PropTypes.object,
  value: React.PropTypes.array,
};

function mapStateToProps() {
  return { }
}

const wrappedExpenseTypeModal = Form.create()(ExternalParticipantName);

export default connect(mapStateToProps, null, null, { withRef: true })(wrappedExpenseTypeModal)