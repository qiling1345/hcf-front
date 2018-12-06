import { Form, Row, Col, Input, Button, Icon, Switch, Select } from 'antd';
import React from 'react';
const FormItem = Form.Item;
import commonService from 'services/common';

import './search-form.less';

import { connect } from "dva"


@connect(state => state)

class AdvancedSearchForm extends React.Component {
  state = {
    expand: false,
    options: []
  };

  componentDidMount() {

    if (this.props.getRef) {
      this.props.getRef(this);
    }

    let { formItems } = this.props;

    formItems.map(item => {
      if ((!item.options || !item.options.length) && item.url) {
        this.getOptions(item);
      }
    });
  }

  handleSearch = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      this.props.search && this.props.search(values);
    });
  };

  handleReset = () => {
    this.props.form.resetFields();
  };

  toggle = () => {
    const { expand } = this.state;
    this.setState({ expand: !expand });
  };

  clear = () => {
    this.props.onClear && this.props.onClear();
    this.props.form.resetFields();
  }

  getOptions = item => {
    commonService.getInterface(item.url).then(res => {
      if (res.data) {
        let options = res.data.map(o => {
          return { label: o[item.labelKey], value: o[item.valueKey] };
        });
        this.setState({ options: { [item.id]: options } });
      }
    });
  };

  // To generate mock Form.Item
  getFields() {
    const { getFieldDecorator } = this.props.form;
    const { formItems = [] } = this.props;
    const children = [];
    const count = this.state.expand ? formItems.length : 4;


    formItems.map((item, i) => {
      if (item.dataIndex) {

        let options = {};

        if (item.defaultValue) {
          let key = "";
          item.defaultValue.replace(/\$\{(.+)\}/g, (target, result) => {
            key = result;
          });

          if (key) {
            let temp = this.getValue(this.props, key);
            if (temp && temp.length) {
              item.defaultValue = temp[0];
            }
          }

          options.initialValue = item.defaultValue;
        }

        children.push(
          <Col span={item.colSpan || 6} key={item.dataIndex} style={{ display: i < count ? 'block' : 'none' }}>
            <FormItem label={item.label}>
              {getFieldDecorator(item.dataIndex, options)(this.renderItem(item))}
            </FormItem>
          </Col>
        );
      }
    });

    return children;
  }

  getValue(data, ...args) {
    const res = JSON.stringify(data);
    return args.map((item) => (new Function(`try {return ${res}.${item} } catch(e) {}`))());
  }

  renderItem = item => {

    const { options } = this.state;

    switch (item.typeCode) {
      case 'input':
        return <Input placeholder={item.placeholder} />;
      case 'switch':
        return (
          <Switch
            checkedChildren={<Icon type="check" />}
            unCheckedChildren={<Icon type="close" />}
          />
        );
      case 'select':
        return (
          <Select placeholder={item.placeholder}>
            {options[item.id] &&
              options[item.id].map(option => {
                return <Select.Option key={option.value}>{option.label}</Select.Option>;
              })}
          </Select>
        );
      default:
        return <Input placeholder={item.placeholder} />;
    }
  };

  render() {
    return (
      <Form className="ant-advanced-search-form" onSubmit={this.handleSearch}>
        <Row gutter={24}>{this.getFields()}</Row>
        <Row>
          <Col span={24} style={{ textAlign: 'right' }}>
            <Button type="primary" htmlType="submit">
              搜索
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={this.handleReset}>
              清除
            </Button>
            {this.props.formItems &&
              this.props.formItems.length > 4 && (
                <a style={{ marginLeft: 8, fontSize: 12 }} onClick={this.toggle}>
                  {this.state.expand ? '收缩' : '展开'}{' '}
                  <Icon type={this.state.expand ? 'up' : 'down'} />
                </a>
              )}
          </Col>
        </Row>
      </Form>
    );
  }
}



const WrappedAdvancedSearchForm = Form.create()(AdvancedSearchForm);

export default WrappedAdvancedSearchForm;
