/**
 * Created by zhouli on 18/2/8
 * Email li.zhou@huilianyi.com
 */
import React from 'react';
import { connect } from 'react-redux';
import { Button, Form, Input, Select, Switch, Icon } from 'antd';
import 'styles/enterprise-manage/org-structure/org-component/org-new-dep.scss';
import OrgService from 'containers/enterprise-manage/org-structure/org-structure.service';
import { LanguageInput } from 'components/index';
import { messages } from "share/common";

const FormItem = Form.Item;
const Option = Select.Option;
//两种种类型
//创建子部门
//创建平级部门
class OrgNewDep extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      fKey: 0,
      c_type: "",//C_CHILD 与 C_DEP 代表创建子部门与平级部门
      dep: {
        i18n: {
          name: []
        }
      }
    };
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.params.flag &&!this.props.params.flag){
      this.setDepByprops(nextProps.params);
    }
    if(!nextProps.params.flag&&this.props.params.flag){
      this.setState({dep:{i18n:{},name:''}},()=>{this.props.form.resetFields();});
    }
  }

  componentDidMount() {
    let params = this.props.params;
    this.setDepByprops(params)

  }

  setDepByprops = (params) => {
    let dep = this.state.dep;
    if (params) {
      if (params.c_type === "C_CHILD") {
        dep.parentName = params.name;
        dep.parentDepartmentOID = params.departmentOID;
        //dep.name = "";
        dep.custDeptNumber = "";
        dep.treeNode = params.treeNode;
        this.setState({ c_type: "C_CHILD" })
      } else if (params.c_type === "C_DEP") {
        if (params.parentDepartmentOID || params.parentId) {
          dep.parentName = params.path.split("|")[0];
          dep.parentDepartmentOID = params.parentDepartmentOID;
          dep.parentId = params.parentId;
        } else {
          // "无";
          dep.parentName = messages('org-new-dep.empty');
          dep.parentDepartmentOID = null;
          dep.parentId = null;
        }
        //dep.name = "";
        dep.custDeptNumber = "";
        dep.treeNode = params.treeNode;
        this.setState({ c_type: "C_DEP" })
      }
      this.setState({ dep: dep })
    }
  }
  onCancel = () => {
    let fKey = this.state.fKey;
    fKey++;
    this.setState({
      fKey,
    })
    this.props.form.resetFields();
    this.props.close(false);
  }
  handleSubmit = (e) => {
    let dep = this.state.dep;
    e.preventDefault();
    if (this.state.c_type === "C_CHILD") {
      this.props.form.validateFieldsAndScroll((err, values) => {
        if (!err) {
          values.parentDepartmentOID = this.state.dep.parentDepartmentOID;
          values.parentId = this.state.dep.parentId;
          values.i18n = dep.i18n;
          values.name = dep.name;
          this.createChildDep(values, this.state.dep.treeNode);
        }
      })
    } else if (this.state.c_type === "C_DEP") {
      this.props.form.validateFieldsAndScroll((err, values) => {
        if (!err) {
          values.parentDepartmentOID = this.state.dep.parentDepartmentOID;
          values.parentId = this.state.dep.parentId;
          values.i18n = dep.i18n;
          values.name = dep.name;
          this.createTopDep(values, this.state.dep.treeNode);
        }
      })
    }
  }
  handleFormChange = () => {
    this.setState({
      loading: false
    })
  }
  //创建子部门
  //treeNode当前部门树节点
  createChildDep = (data, treeNode) => {
    this.setState({
      loading: true
    })
    OrgService.createChildDep(data, treeNode)
      .then((res) => {
        this.onCancel();
        this.setState({
          loading: false
        })
      })
      .catch(() => {
        this.setState({
          loading: false
        })
      })
  }
  //创建顶层部门,或者平级部门
  //treeNode当前部门树节点
  createTopDep = (data, treeNode) => {
    this.setState({
      loading: true
    })
    OrgService.createTopDep(data, treeNode)
      .then((res) => {
        this.onCancel();
        this.setState({
          loading: false
        })
      })
      .catch(() => {
        this.setState({
          loading: false
        })
      })
  }

  i18nChange = (name, i18nName) => {
    let dep = this.state.dep;
    dep.name = name;
    dep.i18n = {
      name: i18nName
    };
    this.setState({
      dep,
    })
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { loading, dep } = this.state;
    const formItemLayout = {};
    return (
      <div className="org-new-dep">
        <Form onSubmit={this.handleSubmit} onChange={this.handleFormChange}>
          {/*所属部门*/}
          <FormItem {...formItemLayout}
            label={messages('org-new-dep.in-dep')}
          >
            {getFieldDecorator('parentName', {
              initialValue: dep.parentName,
              rules: [],
            })(
              <Input disabled={true} placeholder={messages('common.please.enter')} />
              )}
          </FormItem>

          {/*部门名称*/}
          <FormItem {...formItemLayout}>
            <div className="new-lp-row-wrap">
              <div className="new-lp-row">
                <span className="new-lp-row-re">*</span>
                <span>
                  {/*部门名称：*/}
                  {messages('org-new-dep.dep-name')}:
                </span>
              </div>
              <div>
                <LanguageInput
                  key={this.state.fKey}
                  name={dep.name}
                  i18nName={dep.i18n.name}
                  isEdit={false}
                  nameChange={this.i18nChange}
                />
              </div>
            </div>
          </FormItem>

          {/*部门编码*/}
          <FormItem {...formItemLayout}
            label={messages('org-new-dep.dep-code')}
          >
            {getFieldDecorator('custDeptNumber', {
              initialValue: dep.custDeptNumber,
              rules: [
                {
                  required: true,
                  message: messages('common.please.enter')
                },
              ],
            })(
              <Input placeholder={messages('common.please.enter')} />
              )}
          </FormItem>

          <div className="slide-footer">
            <Button type="primary" htmlType="submit" loading={loading}>{messages('common.save')}</Button>
            <Button onClick={this.onCancel}>{messages('common.cancel')}</Button>
          </div>
        </Form>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    organization: state.budget.organization,
    company: state.login.company,
    language: state.main.language,
    tenantMode: state.main.tenantMode
  }
}

const WrappedOrgNewDep = Form.create()(OrgNewDep);
export default connect(mapStateToProps)(WrappedOrgNewDep);
