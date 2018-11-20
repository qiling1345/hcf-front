import { createElement } from 'react';
import dynamic from 'dva/dynamic';
import pathToRegexp from 'path-to-regexp';
import { getMenuData } from './menu';

let routerDataCache;

const modelNotExisted = (app, model) =>
  // eslint-disable-next-line
  !app._models.some(({ namespace }) => {
    return namespace === model.substring(model.lastIndexOf('/') + 1);
  });

// wrapper of dynamic
const dynamicWrapper = (app, models, component) => {
  // () => require('module')
  // transformed by babel-plugin-dynamic-import-node-sync
  if (component.toString().indexOf('.then(') < 0) {
    models.forEach(model => {
      if (modelNotExisted(app, model)) {
        // eslint-disable-next-line
        app.model(require(`../models/${model}`).default);
      }
    });
    return props => {
      if (!routerDataCache) {
        routerDataCache = getRouterData(app);
      }
      return createElement(component().default, {
        ...props,
        routerData: routerDataCache,
      });
    };
  }
  // () => import('module')
  return dynamic({
    app,
    models: () =>
      models.filter(model => modelNotExisted(app, model)).map(m => import(`../models/${m}.js`)),
    // add routerData prop
    component: () => {
      if (!routerDataCache) {
        routerDataCache = getRouterData(app);
      }
      return component().then(raw => {
        const Component = raw.default || raw;
        return props =>
          createElement(Component, {
            ...props,
            routerData: routerDataCache,
          });
      });
    },
  });
};

function getFlatMenuData(menus) {
  let keys = {};
  menus.forEach(item => {
    if (item.children) {
      keys[item.path] = {
        ...item,
      };
      keys = {
        ...keys,
        ...getFlatMenuData(item.children),
      };
    } else {
      keys[item.path] = {
        ...item,
      };
    }
  });
  return keys;
}

export const getRouterData = app => {
  const routerConfig = {
    '/': {
      component: dynamicWrapper(app, ['user', 'login'], () => import('../layouts/BasicLayout')),
    },
    '/dashboard': {
      component: dynamicWrapper(app, [], () => import('../containers/dashboard')),
      name: '仪表盘',
    },
    '/setting/menu': {
      component: dynamicWrapper(app, [], () => import('../routes/Menu/index')),
    },
    '/setting/role': {
      component: dynamicWrapper(app, [], () => import('../routes/Role/index')),
    },
    '/setting/employee': {
      component: dynamicWrapper(app, [], () => import('../routes/Employee/index')),
    },
    '/setting/language/language-modules/:langType': {
      component: dynamicWrapper(app, [], () => import('../routes/Language/module-list')),
      name: '模块列表',
      parent: '/setting/language',
    },
    '/setting/language/language-setting/:moduleId': {
      component: dynamicWrapper(app, [], () => import('../routes/Language/setting')),
      name: '语言列表',
      parent: '/setting/language/language-modules/:langType',
    },
    '/setting/language/other-language-setting/:langType/:moduleId': {
      component: dynamicWrapper(app, [], () => import('../routes/Language/other-language-setting')),
      name: '语言列表',
      parent: '/setting/language/language-modules/:langType',
    },
    '/setting/language': {
      component: dynamicWrapper(app, [], () => import('../routes/Language/index')),
    },
    // "/view/:id": {
    //   component: dynamicWrapper(app, [], () => import('../routes/View/index')),
    // },
    '/setting/component-manager': {
      component: dynamicWrapper(app, ['chart'], () => import('../routes/component-manager/index')),
    },
    '/setting/interface': {
      component: dynamicWrapper(app, [], () => import('../routes/Interface/index')),
    },
    '/setting/modules': {
      component: dynamicWrapper(app, ['chart'], () => import('../routes/Modules/index')),
    },
    '/setting/priview': {
      component: dynamicWrapper(app, ['chart'], () =>
        import('../routes/component-manager/priview')
      ),
      name: '预览',
    },
    '/result/success': {
      component: dynamicWrapper(app, [], () => import('../routes/Result/Success')),
    },
    '/result/fail': {
      component: dynamicWrapper(app, [], () => import('../routes/Result/Error')),
    },
    '/exception/403': {
      component: dynamicWrapper(app, [], () => import('../routes/Exception/403')),
    },
    '/exception/404': {
      component: dynamicWrapper(app, [], () => import('../routes/Exception/404')),
    },
    '/exception/500': {
      component: dynamicWrapper(app, [], () => import('../routes/Exception/500')),
    },
    '/exception/trigger': {
      component: dynamicWrapper(app, ['error'], () =>
        import('../routes/Exception/triggerException')
      ),
    },
    '/user': {
      component: dynamicWrapper(app, [], () => import('../layouts/UserLayout')),
    },
    '/user/login': {
      component: dynamicWrapper(app, ['login'], () => import('../routes/User/Login')),
    },
    '/user/register': {
      component: dynamicWrapper(app, ['register'], () => import('../routes/User/Register')),
    },
    '/user/register-result': {
      component: dynamicWrapper(app, [], () => import('../routes/User/RegisterResult')),
    },
    //我的预付款
    '/pre-payment/my-pre-payment': {
      component: dynamicWrapper(app, [], () =>
        import('containers/pre-payment/my-pre-payment/me-pre-payment.js')
      ),
      name: 'prepayment',
    },
    //预付款复核
    '/pre-payment/pre-payment-recheck': {
      component: dynamicWrapper(app, [], () =>
        import('containers/pre-payment/pre-payment-re-check/pre-payment-re-check.js')
      ),
      name: 'prepayment-recheck',
    },
    //预付款复核详情
    '/pre-payment/pre-payment-recheck/pre-payment-detail/:id': {
      component: dynamicWrapper(app, [], () =>
        import('containers/pre-payment/pre-payment-re-check/pre-payment-re-check-detail.js')
      ),
      name: 'prepayment-detail',
      parent: '/pre-payment/pre-payment-recheck',
    },
    //新建预付款
    '/pre-payment/my-pre-payment/new-pre-payment/:id/:prePaymentTypeId/:formOid': {
      component: dynamicWrapper(app, [], () =>
        import('containers/pre-payment/my-pre-payment/new-pre-payment.js')
      ),
      name: 'new-prepayment',
      parent: '/pre-payment/my-pre-payment',
    },
    //编辑预付款
    '/pre-payment/my-pre-payment/edit-pre-payment/:id/:prePaymentTypeId/:formOid': {
      component: dynamicWrapper(app, [], () =>
        import('containers/pre-payment/my-pre-payment/new-pre-payment.js')
      ),
      name: 'edit-prepayment',
      parent: '/pre-payment/my-pre-payment',
    },
    //预付款详情
    '/pre-payment/me-pre-payment/pre-payment-detail/:id/:flag': {
      component: dynamicWrapper(app, [], () =>
        import('containers/pre-payment/my-pre-payment/pre-payment-detail.js')
      ),
      name: 'prepayment-detail',
      parent: '/pre-payment/my-pre-payment',
    },
    //我的报账单
    '/my-reimburse': {
      component: dynamicWrapper(app, [], () =>
        import('containers/reimburse/my-reimburse/my-reimburse.js')
      ),
      name: 'my-reimburse',
    },
    //我的报账单详情
    '/my-reimburse/reimburse-detail/:id': {
      component: dynamicWrapper(app, [], () =>
        import('containers/reimburse/my-reimburse/reimburse-detail.js')
      ),
      name: 'reimburse-detail',
      parent: '/my-reimburse',
    },
    //编辑我的报账单
    '/my-reimburse/edit-reimburse/:id': {
      component: dynamicWrapper(app, [], () =>
        import('containers/reimburse/my-reimburse/new-reimburse.js')
      ),
      name: 'edit-reimburse',
      parent: '/my-reimburse',
    },
    //新建报账单
    '/my-reimburse/new-reimburse/:formId/:formOID': {
      component: dynamicWrapper(app, [], () =>
        import('containers/reimburse/my-reimburse/new-reimburse.js')
      ),
      name: 'new-reimburse',
      parent: '/my-reimburse',
    },
    '/expense-adjust/my-expense-adjust': {
      component: dynamicWrapper(app, [], () =>
        import('containers/expense-adjust/expense-adjust/expense-adjust')
      ),
      name: 'my-expense-adjust1',
    },
    '/expense-adjust/my-expense-adjust/new-expense-adjust/:id/:expenseAdjustTypeId': {
      component: dynamicWrapper(app, [], () =>
        import('containers/expense-adjust/expense-adjust/new-expense-adjust')
      ),
      name: 'new-expense-adjust',
      parent: '/expense-adjust/my-expense-adjust',
    },
    '/expense-adjust/my-expense-adjust/expense-adjust-detail/:id/:expenseAdjustTypeId/:type': {
      component: dynamicWrapper(app, [], () =>
        import('containers/expense-adjust/expense-adjust/expense-adjust-detail')
      ),
      name: 'expense-adjust-detail',
      parent: '/expense-adjust/my-expense-adjust',
    },
    '/approval-management/approve-expense-adjust': {
      //费用调整单审批
      component: dynamicWrapper(app, [], () =>
        import('containers/expense-adjust/exp-approve/expense-adjust-approve')
      ),
      name: 'approve-expense-adjust',
    },
    '/approval-management/approve-expense-adjust/expense-adjust-approve-detail/:expenseAdjustTypeId/:id/:entityOID/:flag': {
      //费用调整单审批详情
      component: dynamicWrapper(app, [], () =>
        import('containers/expense-adjust/exp-approve/expense-adjust-approve-detail')
      ),
      name: 'approve-exp-adjust',
      parent: '/approval-management/approve-expense-adjust',
    },
    '/document-type-manage/exp-adjust-type/:setOfBooksId': {
      //调整单类型定义
      component: dynamicWrapper(app, [], () =>
        import('containers/expense-adjust/exp-adjust-type/exp-adjust-type')
      ),
      name: 'exp-adjust-type-define',
    },
    '/document-type-manage/exp-adjust-type/distribution-company-exp-adjust-type/:setOfBooksId/:id': {
      component: dynamicWrapper(app, [], () =>
        import('containers/expense-adjust/exp-adjust-type/distribution-company-exp-adjust-type')
      ),
      name: 'exp-adjust-type-company',
      parent: '/document-type-manage/exp-adjust-type/:setOfBooksId',
    },
    '/document-type-manage/contract-type': {
      component: dynamicWrapper(app, [], () =>
        import('containers/contract/contract-type/contract-type-define.js')
      ),
      name: 'contract-type',
    },
    //预付款类型
    '/document-type-manage/prepayment-type': {
      component: dynamicWrapper(app, [], () =>
        import('containers/pre-payment/prepayment-type/pre-payment-type.js')
      ),
      name: 'prepayment-type',
    },
    //预付款分配公司
    '/document-type-manage/prepayment-type/distribution-company/:setOfBooksId/:id': {
      component: dynamicWrapper(app, [], () =>
        import('containers/pre-payment/prepayment-type/distribution-company.js')
      ),
      name: 'distribution-company',
      parent: '/document-type-manage/prepayment-type',
    },
    '/approval-management/pre-payment-approve': {
      //预付款工作流审批
      component: dynamicWrapper(app, [], () =>
        import('containers/pre-payment/pre-payment-approve/pre-payment.js')
      ),
      name: 'pre-payment-approve',
    },
    '/approval-management/pre-payment-approve/pre-payment-approve-detail/:id/:entityOID/:status': {
      //预付款工作流审批详情
      component: dynamicWrapper(app, [], () =>
        import('containers/pre-payment/pre-payment-approve/pre-payment-detail.js')
      ),
      name: 'prepayment-detail',
      parent: '/approval-management/pre-payment-approve',
    },
    '/document-type-manage/contract-type/new-contract-type': {
      component: dynamicWrapper(app, [], () =>
        import('containers/contract/contract-type/new-contract-type.js')
      ),
      name: 'new-contract-type',
      parent: '/document-type-manage/contract-type',
    },
    '/document-type-manage/contract-type/company-distribution/:setOfBooksId/:id': {
      component: dynamicWrapper(app, [], () =>
        import('containers/contract/contract-type/company-distribution.js')
      ),
      name: 'contract-company-distribution',
      parent: '/document-type-manage/contract-type',
    },
    '/contract-manage/contract-recheck': {
      //合同复核
      component: dynamicWrapper(app, [], () =>
        import('containers/contract/contract-approve/contract.js')
      ),
      name: 'contract-recheck',
    },
    '/contract-manage/contract-recheck/contract-detail/:id/:status': {
      //合同复核详情
      component: dynamicWrapper(app, [], () =>
        import('containers/contract/contract-approve/contract-detail.js')
      ),
      name: 'contract-detail',
      parent: '/contract-manage/contract-recheck',
    },
    '/contract-manage/my-contract': {
      //我的合同
      component: dynamicWrapper(app, [], () =>
        import('containers/contract/my-contract/my-contract.js')
      ),
      name: 'my-contract',
    },
    '/approval-management/contract-approve': {
      //合同工作流审批
      component: dynamicWrapper(app, [], () =>
        import('containers/contract/contract-approve/contract-workflow-approve.js')
      ),
      name: 'contract-approve',
    },
    '/approval-management/contract-approve/contract-workflow-approve-detail/:id/:entityOID/:entityType/:status': {
      //合同工作流审批详情
      component: dynamicWrapper(app, [], () =>
        import('containers/contract/contract-approve/contract-workflow-approve-detail.js')
      ),
      name: 'contract-detail',
      parent: '/approval-management/contract-approve',
    },
    '/contract-manage/my-contract/new-contract/:contractTypeId': {
      //合同新建
      component: dynamicWrapper(app, [], () =>
        import('containers/contract/my-contract/new-contract.js')
      ),
      name: 'new-contract',
      parent: '/contract-manage/my-contract',
    },
    '/contract-manage/my-contract/edit-contract/:id/:contractTypeId': {
      //合同编辑
      component: dynamicWrapper(app, [], () =>
        import('containers/contract/my-contract/new-contract.js')
      ),
      name: 'edit-contract',
      parent: '/contract-manage/my-contract',
    },
    '/contract-manage/my-contract/contract-detail/:id': {
      //合同详情
      component: dynamicWrapper(app, [], () =>
        import('containers/contract/my-contract/contract-detail.js')
      ),
      name: 'contract-detail',
      parent: '/contract-manage/my-contract',
    },
    '/request': {
      //申请单
      component: dynamicWrapper(app, [], () => import('containers/request/request.js')),
      name: 'request',
    },
    '/request/jd-request-edit/:formOID/:applicationOID': {
      //京东申请单编辑页
      component: dynamicWrapper(app, [], () => import('containers/request/jd-request-edit')),
      name: 'jd-request-edit',
    },
    '/request/new-request/:formOID/:applicantOID': {
      //新建申请单
      component: dynamicWrapper(app, [], () => import('containers/request/new-edit-request')),
      name: 'new-request',
      parent: '/request',
    },
    '/request/request-edit/:formOID/:applicationOID': {
      //编辑申请单
      component: dynamicWrapper(app, [], () => import('containers/request/new-edit-request')),
      name: 'request-edit',
      parent: '/request',
    },
    '/request/request-detail/:formOID/:applicationOID/:pageFrom': {
      //申请单详情
      component: dynamicWrapper(app, [], () => import('containers/request/base-request-detail')),
      name: 'request-detail',
      parent: '/request',
    },
    '/approval-management/approve-request': {
      //申请单审批
      component: dynamicWrapper(app, [], () => import('containers/approve/request/request')),
      name: 'request-approve',
    },
    '/approval-management/approve-request/approve-request-detail/:formOID/:applicationOID/:pageFrom': {
      //申请单审批详情
      component: dynamicWrapper(app, [], () => import('containers/request/base-request-detail')),
      name: 'request-detail',
      parent: '/approval-management/approve-request',
    },
    '/payment-requisition/my-payment-requisition': {
      component: dynamicWrapper(app, [], () =>
        import('containers/payment-requisition/payment-requisition.js')
      ),
      name: 'payment-requisition', // 付款申请单
    },
    '/payment-requisition/my-payment-requisition/new-payment-requisition/:id/:typeId': {
      component: dynamicWrapper(app, [], () =>
        import('containers/payment-requisition/new-payment-requisition.js')
      ),
      name: 'new-payment-requisition',
      parent: '/payment-requisition/my-payment-requisition',
    },
    '/payment-requisition/my-payment-requisition/edit-payment-requisition/:id/:typeId': {
      component: dynamicWrapper(app, [], () =>
        import('containers/payment-requisition/new-payment-requisition.js')
      ),
      name: 'edit-payment-requisition',
      parent: '/payment-requisition/my-payment-requisition',
    },
    '/payment-requisition/my-payment-requisition/payment-requisition-detail/:id': {
      component: dynamicWrapper(app, [], () =>
        import('containers/payment-requisition/new-payment-requisition-detail.js')
      ),
      name: 'payment-requisition-detail',
      parent: '/payment-requisition/my-payment-requisition',
    },
    '/job/job-actuator': {
      component: dynamicWrapper(app, [], () => import('containers/job/job-actuator.js')),
      name: 'job-actuator', // 执行器
    },
    '/job/job-info': {
      component: dynamicWrapper(app, [], () => import('containers/job/job-info.js')),
      name: 'job-info', // 任务详情
    },
    '/job/job-log': {
      component: dynamicWrapper(app, [], () => import('containers/job/job-log.js')),
      name: 'job-log', // 任务日志
    },

    '/document-type-manage/payment-requisition-type': {
      component: dynamicWrapper(app, [], () =>
        import('containers/payment-requisition/type/acp-request-type.js')
      ),
      name: 'payment-requisition-type', // 付款申请单类型定义
    },
    '/document-type-manage/payment-requisition/acp-request-type/distribution-company/:setOfBooksId/:id': {
      component: dynamicWrapper(app, [], () =>
        import('containers/payment-requisition/type/distribution-company.js')
      ),
      name: 'payment-distribution-company',
      parent: '/document-type-manage/payment-requisition-type',
    },
    '/document-type-manage/gl-work-order-type': {
      //核算工单类型定义
      component: dynamicWrapper(app, [], () =>
        import('containers/gl-work-order/gl-work-order-type/gl-work-order-type.js')
      ),
      name: 'gl-work-order-type',
    },
    '/document-type-manage/gl-work-order-type/new-gl-work-order-type': {
      component: dynamicWrapper(app, [], () =>
        import('containers/gl-work-order/gl-work-order-type/new-gl-work-order-type.js')
      ),
      name: 'new-gl-work-order-type',
      parent: '/document-type-manage/gl-work-order-type',
    },
    '/document-type-manage/gl-work-order-type/company-distribution/:setOfBooksId/:id': {
      component: dynamicWrapper(app, [], () =>
        import('containers/gl-work-order/gl-work-order-type/distribution-company.js')
      ),
      name: 'order-type-company-distribution',
      parent: '/document-type-manage/gl-work-order-type',
    },
    //核算工单
    '/gl-work-order/my-gl-work-order': {
      component: dynamicWrapper(app, [], () =>
        import('containers/gl-work-order/my-gl-work-order/my-gl-work-order.js')
      ),
      name: 'my-gl-work-order',
    },
    //新建核算工单
    '/gl-work-order/my-gl-work-order/new-gl-work-order/:typeId/:formOid/:id': {
      component: dynamicWrapper(app, [], () =>
        import('containers/gl-work-order/my-gl-work-order/new-gl-work-order.js')
      ),
      name: 'new-gl-work-order',
      parent: '/gl-work-order/my-gl-work-order',
    },
    //核算工单详情
    '/gl-work-order/my-gl-work-order/my-gl-work-order-detail/:id/:oid': {
      component: dynamicWrapper(app, [], () =>
        import('containers/gl-work-order/my-gl-work-order/my-gl-work-order-detail.js')
      ),
      name: 'my-gl-work-order-detail',
      parent: '/gl-work-order/my-gl-work-order',
    },
    '/pay-setting/payment-method': {
      component: dynamicWrapper(app, [], () =>
        import('containers/pay-setting/payment-method/payment-method.js')
      ),
      name: 'payment-method', // 付款方式
    },
    '/pay-setting/cash-flow-item': {
      component: dynamicWrapper(app, [], () =>
        import('containers/pay-setting/cash-flow-item/cash-flow-item.js')
      ),
      name: 'cash-flow-item', // 现金流量项
    },
    '/pay-setting/cash-transaction-class': {
      component: dynamicWrapper(app, [], () =>
        import('containers/pay-setting/cash-transaction-class/cash-transaction-class.js')
      ),
      name: 'cash-transaction-class', // 现金事务分类
    },
    '/pay-setting/cash-transaction-class/new-cash-transaction-class/:setOfBooksId': {
      component: dynamicWrapper(app, [], () =>
        import('containers/pay-setting/cash-transaction-class/new-cash-transaction-class.js')
      ),
      name: 'new-cash-transaction-class',
      parent: '/pay-setting/cash-transaction-class',
    },
    '/pay-setting/cash-transaction-class/cash-transaction-class-detail/:id': {
      component: dynamicWrapper(app, [], () =>
        import('containers/pay-setting/cash-transaction-class/cash-transaction-class-detail.js')
      ),
      name: 'cash-transaction-class-detail',
      parent: '/pay-setting/cash-transaction-class',
    },
    '/pay-setting/company-account-setting': {
      component: dynamicWrapper(app, [], () =>
        import('containers/pay-setting/company-account-setting/company-account-setting.js')
      ),
      name: 'company-account-setting', // 公司账户设置
    },
    '/pay-setting/payment-company-setting': {
      component: dynamicWrapper(app, [], () =>
        import('containers/pay-setting/payment-company-setting/payment-company-setting.js')
      ),
      name: 'payment-company-setting', // 付款公司配置
    },
    '/pay-setting/company-account-setting/bank-account-detail/:companyBankId': {
      component: dynamicWrapper(app, [], () =>
        import('containers/pay-setting/company-account-setting/bank-account-detail.js')
      ),
      name: 'bank-account-detail',
      parent: '/pay-setting/company-account-setting',
    },
    '/approval-management/gl-work-order-approval': {
      //核算工单审批
      component: dynamicWrapper(app, [], () =>
        import('containers/gl-work-order/gl-work-order-approval/gl-work-order-approval.js')
      ),
      name: 'gl-work-order-approval',
    },
    '/approval-management/gl-work-order-approval/gl-work-order-approval-detail/:id/:oid/:status': {
      //核算工单审批详情
      component: dynamicWrapper(app, [], () =>
        import('containers/gl-work-order/gl-work-order-approval/gl-work-order-approval-detail.js')
      ),
      name: 'gl-work-order-approval-detail',
      parent: '/approval-management/gl-work-order-approval',
    },
    '/financial-management/csh-write-off-backlash': {
      //核销反冲
      component: dynamicWrapper(app, [], () =>
        import('containers/financial-management/csh-write-off-backlash/csh-write-off-backlash')
      ),
      name: 'csh-write-off-backlash',
    },
    '/financial-management/supplier-maintain': {
      //财务管理-供应商维护
      component: dynamicWrapper(app, [], () =>
        import('containers/financial-management/supplier-management/supplier-management.js')
      ),
      name: 'supplier-maintain',
    },
    '/financial-management/supplier-maintain/new-update-supplier': {
      component: dynamicWrapper(app, [], () =>
        import('containers/financial-management/supplier-management/new-update-supplier.js')
      ),
      name: 'supplier-maintain',
      parent: '/financial-management/supplier-maintain',
    },
    '/financial-management/supplier-maintain/supplier-bank-account/:id/:source': {
      component: dynamicWrapper(app, [], () =>
        import('containers/financial-management/supplier-management/supplier-bank-account.js')
      ),
      name: 'supplier-bank-account',
      parent: '/financial-management/supplier-maintain',
    },
    '/financial-management/supplier-maintain/delivery-company/:id': {
      component: dynamicWrapper(app, [], () =>
        import('containers/financial-management/supplier-management/supplier-company-delivery.js')
      ),
      name: 'supplier-delivery-company',
      parent: '/financial-management/supplier-maintain',
    },
    //表单管理
    '/admin-setting/form-list': {
      component: dynamicWrapper(app, [], () => import('containers/setting/form/form-list.js')),
      name: 'form-list',
    },
    //值列表
    '/admin-setting/value-list/:tab': {
      component: dynamicWrapper(app, [], () =>
        import('containers/setting/value-list/value-list.js')
      ),
      name: 'value-list',
    },
    //新建值列表
    '/admin-setting/new-value-list/:tab': {
      component: dynamicWrapper(app, [], () =>
        import('containers/setting/value-list/new-value-list.js')
      ),
      name: 'new-value-list',
      parent: '/admin-setting/value-list/:tab',
    },
    //值列表详情
    '/admin-setting/value-list-detail/:customEnumerationOID/:id/:tab': {
      component: dynamicWrapper(app, [], () =>
        import('containers/setting/value-list/new-value-list.js')
      ),
      name: 'value-list',
      parent: '/admin-setting/value-list/:tab',
    },
    '/financial-management/reimburse-review': {
      //财务管理-供应商维护
      component: dynamicWrapper(app, [], () =>
        import('containers/reimburse/reimburse-review/reimburse-review.js')
      ),
      name: 'reimburse-review',
    },
    '/financial-management/reimburse-review/reimburse-detail/:id': {
      component: dynamicWrapper(app, [], () =>
        import('containers/reimburse/reimburse-review/reimburse-review-detail.js')
      ),
      name: 'reimburse-review-detail',
      parent: '/financial-management/reimburse-review',
    },
    //编码规则对象定义
    '/admin-setting/coding-rule-object': {
      component: dynamicWrapper(app, [], () =>
        import('containers/setting/coding-rule-object/coding-rule-object.js')
      ),
      name: 'coding-rule-object',
    },
    //新建编码规则对象定义
    '/admin-setting/new-coding-rule-object': {
      component: dynamicWrapper(app, [], () =>
        import('containers/setting/coding-rule-object/new-coding-rule-object.js')
      ),
      name: 'new-coding-rule-object',
      parent: '/admin-setting/coding-rule-object',
    },
    //编码规则
    '/admin-setting/coding-rule/:id': {
      component: dynamicWrapper(app, [], () =>
        import('containers/setting/coding-rule-object/coding-rule.js')
      ),
      name: 'coding-rule',
      parent: '/admin-setting/coding-rule-object',
    },
    //新建编码规则
    '/admin-setting/new-coding-rule/:id': {
      component: dynamicWrapper(app, [], () =>
        import('containers/setting/coding-rule-object/new-coding-rule.js')
      ),
      name: 'new-coding-rule',
      parent: '/admin-setting/coding-rule-object',
    },
    //编码规则明细
    '/admin-setting/coding-rule-value/:id/:ruleId': {
      component: dynamicWrapper(app, [], () =>
        import('containers/setting/coding-rule-object/coding-rule-value.js')
      ),
      name: 'coding-rule-value',
      parent: '/admin-setting/coding-rule-object',
    },

    '/financial-management/reimburse-review/loan-request-detail-review/:id': {
      component: dynamicWrapper(app, [], () => import('containers/request/loan-request-detail.js')),
      name: 'reimburse-review',
      parent: '/financial-management/reimburse-review',
    },
    //新建表单
    '/admin-setting/form-list/new-form/:formType/:booksID': {
      component: dynamicWrapper(app, [], () =>
        import('containers/setting/form/form-detail/form-detail.js')
      ),
      name: 'new-form',
      parent: '/admin-setting/form-list',
    },
    //表单详情
    '/admin-setting/form-list/form-detail/:formOID/:booksID': {
      component: dynamicWrapper(app, [], () =>
        import('containers/setting/form/form-detail/form-detail.js')
      ),
      name: 'form-detail',
      parent: '/admin-setting/form-list',
    },
    //供应商类型
    '/admin-setting/supplier-type': {
      component: dynamicWrapper(app, [], () =>
        import('containers/setting/supplier-type/supplier-type')
      ),
      name: 'supplier-type',
    },
    '/financial-management/finance-audit': {
      component: dynamicWrapper(app, [], () =>
        import('containers/financial-management/finance-audit/finance-audit')
      ),
      name: 'finance-audit',
    },
    '/financial-accounting-setting/section-structure': {
      //科目段结构，
      component: dynamicWrapper(app, [], () =>
        import('containers/financial-accounting-setting/section-structure/section-structure')
      ),
      name: 'section-structure',
    },
    '/financial-accounting-setting/section-structure/section-setting/:id/:setOfBooksId': {
      //科目段设置
      component: dynamicWrapper(app, [], () =>
        import('containers/financial-accounting-setting/section-structure/section-setting')
      ),
      name: 'section-setting',
      parent: '/financial-accounting-setting/section-structure',
    },
    '/financial-accounting-setting/accounting-source-system': {
      //来源事务定义
      component: dynamicWrapper(app, [], () =>
        import('containers/financial-accounting-setting/accounting-source-system/accounting-source-system')
      ),
      name: 'source-affair-define',
    },
    '/financial-accounting-setting/accounting-source-system/voucher-template/:id/:sourceTransactionType': {
      //凭证模版
      component: dynamicWrapper(app, [], () =>
        import('containers/financial-accounting-setting/accounting-source-system/voucher-template')
      ),
      name: 'voucher-template',
      parent: '/financial-accounting-setting/accounting-source-system',
    },
    '/financial-accounting-setting/accounting-source-system/voucher-template/line-mode-data-rules-system/:lineModelId/:id': {
      //取值规则
      component: dynamicWrapper(app, [], () =>
        import('containers/financial-accounting-setting/accounting-source-system/line-mode-data-rules')
      ),
      name: 'get-value-rule',
      parent: '/financial-accounting-setting/accounting-source-system',
    },
    '/financial-accounting-setting/accounting-source-system/voucher-template/line-mode-judge-rules-system/:lineModelId/:id': {
      //判断规则
      component: dynamicWrapper(app, [], () =>
        import('containers/financial-accounting-setting/accounting-source-system/line-mode-judge-rules')
      ),
      name: 'judge-rules',
      parent: '/financial-accounting-setting/accounting-source-system',
    },
    '/financial-accounting-setting/accounting-source-system/voucher-template/line-mode-rules-system/:lineModelId/:id': {
      //核算规则
      component: dynamicWrapper(app, [], () =>
        import('containers/financial-accounting-setting/accounting-source-system/line-mode-rules')
      ),
      name: 'account-rules',
      parent: '/financial-accounting-setting/accounting-source-system',
    },
    '/financial-accounting-setting/accounting-scenarios-system': {
      //核算场景定义
      component: dynamicWrapper(app, [], () =>
        import('containers/financial-accounting-setting/accounting-scenarios-system/accounting-scenarios-system')
      ),
      name: 'accounting-scenarios-define',
    },
    '/financial-accounting-setting/accounting-scenarios-system/accounting-elements/:id': {
      //核算要素
      component: dynamicWrapper(app, [], () =>
        import('containers/financial-accounting-setting/accounting-scenarios-system/accounting-elements')
      ),
      name: 'account-element',
      parent: '/financial-accounting-setting/accounting-scenarios-system',
    },
    '/financial-accounting-setting/accounting-scenarios/:setOfBooksId': {
      //科目映射规则
      component: dynamicWrapper(app, [], () =>
        import('containers/financial-accounting-setting/accounting-scenarios/accounting-scenarios')
      ),
      name: 'section-map-rule',
    },
    '/financial-accounting-setting/accounting-scenarios/matching-group-elements/:setOfBooksId/:id': {
      //匹配组
      component: dynamicWrapper(app, [], () =>
        import('containers/financial-accounting-setting/accounting-scenarios/matching-group-elements')
      ),
      name: 'match-group-element',
      parent: '/financial-accounting-setting/accounting-scenarios/:setOfBooksId',
    },
    '/financial-accounting-setting/accounting-scenarios/matching-group-elements/subject-matching-setting/:id/:groupId': {
      //科目匹配设置
      component: dynamicWrapper(app, [], () =>
        import('containers/financial-accounting-setting/accounting-scenarios/subject-matching-setting')
      ),
      name: 'subj-match-setting',
      parent: '/financial-accounting-setting/accounting-scenarios/:setOfBooksId',
    },
    '/financial-accounting-setting/accounting-source/:sourceSetOfBooksId': {
      //来源事务凭证模板
      component: dynamicWrapper(app, [], () =>
        import('containers/financial-accounting-setting/accounting-source/accounting-source')
      ),
      name: 'voucher-model',
    },
    '/financial-accounting-setting/accounting-source/voucher-template-sob/:id': {
      //帐套级凭证模板
      component: dynamicWrapper(app, [], () =>
        import('containers/financial-accounting-setting/accounting-source/voucher-template')
      ),
      name: 'sob-voucher-model',
      parent: '/financial-accounting-setting/accounting-source/:sourceSetOfBooksId',
    },
    '/financial-accounting-setting/accounting-source/voucher-template-sob/line-mode-data-rules/:id/:lineModelId': {
      //取值规则
      component: dynamicWrapper(app, [], () =>
        import('containers/financial-accounting-setting/accounting-source/line-mode-data-rules')
      ),
      name: 'get-value-rule',
      parent: '/financial-accounting-setting/accounting-source/:sourceSetOfBooksId',
    },
    '/financial-accounting-setting/accounting-source/voucher-template-sob/line-mode-judge-rules/:id/:lineModelId': {
      //判断规则
      component: dynamicWrapper(app, [], () =>
        import('containers/financial-accounting-setting/accounting-source/line-mode-judge-rules')
      ),
      name: 'judge-rules',
      parent: '/financial-accounting-setting/accounting-source/:sourceSetOfBooksId',
    },
    '/financial-accounting-setting/accounting-source/voucher-template-sob/line-mode-rules/:id/:lineModelId': {
      //核算规则
      component: dynamicWrapper(app, [], () =>
        import('containers/financial-accounting-setting/accounting-source/line-mode-rules')
      ),
      name: 'account-rules',
      parent: '/financial-accounting-setting/accounting-source/:sourceSetOfBooksId',
    },
    //费用类别
    '/admin-setting/expense-type': {
      component: dynamicWrapper(app, [], () =>
        import('containers/setting/expense-type/expense-type.js')
      ),
      name: 'expense-type',
    },
    //审批流 ***被人删了一次了，跪求别再删***
    '/admin-setting/workflow': {
      component: dynamicWrapper(app, [], () => import('containers/setting/workflow/workflow')),
      name: 'workflow',
    },
    '/admin-setting/workflow/workflow-setting/:setOfBooksId/:formOID': {
      //审批流设置
      component: dynamicWrapper(app, [], () =>
        import('containers/setting/workflow/workflow-detail')
      ),
      name: 'workflow-setting-detail',
      parent: '/admin-setting/workflow',
    },
    '/admin-setting/company-group': {
      //公司组
      component: dynamicWrapper(app, [], () =>
        import('containers/setting/company-group/company-group.js')
      ),
      name: 'company-group',
    },
    '/admin-setting/company-group/new-company-group/:companyGroupId': {
      //新建公司组
      component: dynamicWrapper(app, [], () =>
        import('containers/setting/company-group/new-company-group.js')
      ),
      name: 'new-company-group',
      parent: '/admin-setting/company-group',
    },
    '/admin-setting/company-group/company-group-detail/:id': {
      //公司组详情
      component: dynamicWrapper(app, [], () =>
        import('containers/setting/company-group/company-group-detail.js')
      ),
      name: 'company-group-detail',
      parent: '/admin-setting/company-group',
    },
    '/pay/pay-workbench/:tab': {
      //付款工作台
      component: dynamicWrapper(app, [], () =>
        import('containers/pay/pay-workbench/pay-workbench.js')
      ),
      name: 'pay-workbench',
    },
    '/pay/pay-workbench/payment-detail/:tab/:subTab/:id': {
      component: dynamicWrapper(app, [], () =>
        import('containers/pay/pay-workbench/payment-detail.js')
      ),
      name: 'payment-detail',
      parent: '/pay/pay-workbench/:tab',
    },
    //基础数据/银行定义
    '/basic-data/bank-definition': {
      component: dynamicWrapper(app, [], () =>
        import('containers/basic-data/bank-definition/bank-definition.js')
      ),
      name: 'bank-definition',
    },
    //预算设置
    '/budget-setting/budget-organization': {
      //预算组织定义
      component: dynamicWrapper(app, [], () =>
        import('containers/budget-setting/budget-organization/budget-organization')
      ),
      name: 'budget-org-define',
    },
    '/budget-setting/budget-organization/budget-parameter/budget-parameter-setting/:id': {
      //参数设置
      component: dynamicWrapper(app, [], () =>
        import('containers/budget-setting/budget-organization/budget-parameter/budget-parameter-setting')
      ),
      name: 'params-setting',
      parent: '/budget-setting/budget-organization',
    },
    '/budget-setting/budget-organization/new-budget-organization': {
      //新建预算组织
      component: dynamicWrapper(app, [], () =>
        import('containers/budget-setting/budget-organization/new-budget-organization')
      ),
      name: 'budget-org-new',
      parent: '/budget-setting/budget-organization',
    },
    '/budget-setting/budget-organization/budget-organization-detail/:setOfBooksId/:id/:tab': {
      //预算设置详情
      component: dynamicWrapper(app, [], () =>
        import('containers/budget-setting/budget-organization/budget-organization-detail')
      ),
      name: 'budget-org-detail',
      parent: '/budget-setting/budget-organization',
    },
    '/budget-setting/budget-organization/budget-organization-detail/budget-structure/budget-structure-detail/:orgId/:setOfBooksId/:id': {
      //预算表详情
      component: dynamicWrapper(app, [], () =>
        import('containers/budget-setting/budget-organization/budget-structure/budget-structure-detail')
      ),
      name: 'budget-structure-detail',
      parent: '/budget-setting/budget-organization',
    },
    '/budget-setting/budget-organization/budget-organization-detail/budget-structure/new-budget-structure/:setOfBooksId/:orgId': {
      //新建预算表
      component: dynamicWrapper(app, [], () =>
        import('containers/budget-setting/budget-organization/budget-structure/new-budget-structure')
      ),
      name: 'budget-structure-new',
      parent: '/budget-setting/budget-organization',
    },
    '/budget-setting/budget-organization/budget-organization-detail/budget-item/new-budget-item/:setOfBooksId/:orgId': {
      //新建预算项目
      component: dynamicWrapper(app, [], () =>
        import('containers/budget-setting/budget-organization/budget-item/new-budget-item')
      ),
      name: 'budget-item-new',
      parent: '/budget-setting/budget-organization',
    },
    '/budget-setting/budget-organization/budget-organization-detail/budget-item/budget-item-detail/:setOfBooksId/:orgId/:id': {
      //预算项目详情
      component: dynamicWrapper(app, [], () =>
        import('containers/budget-setting/budget-organization/budget-item/budget-item-detail')
      ),
      name: 'budget-item-detail',
      parent: '/budget-setting/budget-organization',
    },
    '/budget-setting/budget-organization/budget-organization-detail/budget-group/new-budget-group/:setOfBooksId/:orgId': {
      //新建项目组
      component: dynamicWrapper(app, [], () =>
        import('containers/budget-setting/budget-organization/budget-group/new-budget-group')
      ),
      name: 'budget-group-new',
      parent: '/budget-setting/budget-organization',
    },
    '/budget-setting/budget-organization/budget-organization-detail/budget-group/budget-group-detail/:setOfBooksId/:orgId/:id': {
      //项目组详情
      component: dynamicWrapper(app, [], () =>
        import('containers/budget-setting/budget-organization/budget-group/budget-group-detail')
      ),
      name: 'budget-group-detail',
      parent: '/budget-setting/budget-organization',
    },
    '/budget-setting/budget-organization/budget-organization-detail/budget-strategy/new-budget-strategy/:setOfBooksId/:orgId': {
      //新建控制策略  **合并时别再删了，第三次了***
      component: dynamicWrapper(app, [], () =>
        import('containers/budget-setting/budget-organization/budget-strategy/new-budget-strategy')
      ),
      name: 'budget-strategy-new',
      parent: '/budget-setting/budget-organization',
    },
    '/budget-setting/budget-organization/budget-organization-detail/budget-strategy/budget-strategy-detail/:setOfBooksId/:orgId/:id': {
      //控制策略详情  **合并时别再删了，第三次了***
      component: dynamicWrapper(app, [], () =>
        import('containers/budget-setting/budget-organization/budget-strategy/budget-strategy-detail')
      ),
      name: 'budget-strategy-detail',
      parent: '/budget-setting/budget-organization',
    },
    '/budget-setting/budget-organization/budget-organization-detail/budget-strategy/budget-strategy-detail/new-budget-strategy-detail/:orgId/:setOfBooksId/:id': {
      //新建控制策略详情  **合并时别再删了，第三次了***
      component: dynamicWrapper(app, [], () =>
        import('containers/budget-setting/budget-organization/budget-strategy/new-budget-strategy-detail')
      ),
      name: 'budget-strategy-detail-new',
      parent: '/budget-setting/budget-organization',
    },
    '/budget-setting/budget-organization/budget-organization-detail/budget-strategy/budget-strategy-detail/strategy-control-detail/:setOfBooksId/:orgId/:strategyId/:id': {
      //策略详情明细  **合并时别再删了，第三次了***
      component: dynamicWrapper(app, [], () =>
        import('containers/budget-setting/budget-organization/budget-strategy/strategy-control-detail')
      ),
      name: 'budget-strategy-detail-detail',
      parent: '/budget-setting/budget-organization',
    },
    '/budget-setting/budget-organization/budget-organization-detail/budget-journal-type/new-budget-journal-type/:setOfBooksId/:orgId': {
      //新建日志记账类型  **合并时别再删了，第三次了***
      component: dynamicWrapper(app, [], () =>
        import('containers/budget-setting/budget-organization/budget-journal-type/new-budget-journal-type')
      ),
      name: 'budget-journal-type-new',
      parent: '/budget-setting/budget-organization',
    },
    '/budget-setting/budget-organization/budget-organization-detail/budget-journal-type/budget-journal-type-detail/:setOfBooksId/:orgId/:id': {
      //日志记账类型详情  **合并时别再删了，第三次了***
      component: dynamicWrapper(app, [], () =>
        import('containers/budget-setting/budget-organization/budget-journal-type/budget-journal-type-detail')
      ),
      name: 'budget-journal-type-detail',
      parent: '/budget-setting/budget-organization',
    },
    '/budget-setting/budget-organization/budget-organization-detail/budget-control-rules/new-budget-control-rules/:setOfBooksId/:orgId': {
      //新控制规则  **合并时别再删了，第三次了***
      component: dynamicWrapper(app, [], () =>
        import('containers/budget-setting/budget-organization/budget-control-rules/new-budget-control-rules')
      ),
      name: 'budget-rule-new',
      parent: '/budget-setting/budget-organization',
    },
    '/budget-setting/budget-organization/budget-organization-detail/budget-control-rules/budget-control-rules-detail/:setOfBooksId/:orgId/:id': {
      //控制规则详情  **合并时别再删了，第三次了***
      component: dynamicWrapper(app, [], () =>
        import('containers/budget-setting/budget-organization/budget-control-rules/budget-control-rules-detail')
      ),
      name: 'budget-rule-detail',
      parent: '/budget-setting/budget-organization',
    },
    '/budget-setting/budget-balance-solution/:setOfBooksId': {
      //预算余额方案
      component: dynamicWrapper(app, [], () =>
        import('containers/budget-setting/budget-balance-solution/budget-balance-solution')
      ),
      name: 'budget-balance-solution',
    },
    '/budget-setting/budget-balance-solution/new-budget-balance-solution/:setOfBooksId/:id': {
      //新建预算余额方案
      component: dynamicWrapper(app, [], () =>
        import('containers/budget-setting/budget-balance-solution/new-budget-balance-solution')
      ),
      name: 'budget-balance-solution-newOrEdit',
      parent: '/budget-setting/budget-balance-solution/:setOfBooksId',
    },
    '/budget/budget-balance': {
      //预算余额
      component: dynamicWrapper(app, [], () =>
        import('containers/budget/budget-balance/budget-balance')
      ),
      name: 'budget-balance',
    },
    '/budget/budget-balance/budget-balance-result/:id': {
      //预算余额查询结果
      component: dynamicWrapper(app, [], () =>
        import('containers/budget/budget-balance/budget-balance-result')
      ),
      name: 'budget-balance-query-result',
      parent: '/budget/budget-balance',
    },
    '/budget/budget-balance-query': {
      //预算余额方案查询
      component: dynamicWrapper(app, [], () =>
        import('containers/budget/budget-balance-query/budget-balance-query')
      ),
      name: 'budget-balance-query',
    },
    '/budget/budget-balance-query/budget-balance-query-result/:id': {
      //预算余额查询方案结果
      component: dynamicWrapper(app, [], () =>
        import('containers/budget/budget-balance-query/budget-balance-query-result')
      ),
      name: 'budget-balance-query-result',
      parent: '/budget/budget-balance-query',
    },

    //预算日记本
    '/budget/budget-journal': {
      component: dynamicWrapper(app, [], () =>
        import('containers/budget/budget-journal/budget-journal.js')
      ),
      name: 'budget-journal',
    },
    //新建预算日记账
    '/budget/budget-journal/new-budget-journal': {
      component: dynamicWrapper(app, [], () =>
        import('containers/budget/budget-journal/new-budget-journal.js')
      ),
      name: 'new-budget-journal',
      parent: '/budget/budget-journal',
    },
    //预算日记账详情
    '/budget/budget-journal/budget-journal-detail/:journalCode': {
      component: dynamicWrapper(app, [], () =>
        import('containers/budget/budget-journal/budget-journal-detail.js')
      ),
      name: 'budget-journal-detail',
      parent: '/budget/budget-journal',
    },
    //预算日记账详情(已经提交过的)
    '/budget/budget-journal/budget-journal-detail-submit/:journalCode': {
      component: dynamicWrapper(app, [], () =>
        import('containers/budget/budget-journal/budget-journal-detail-submit.js')
      ),
      name: 'budget-journal-detail-submit',
      parent: '/budget/budget-journal',
    },
    '/pay/pay-refund': {
      //付款退款
      component: dynamicWrapper(app, [], () =>
        import('containers/pay/pay-refund/pay-refund-query.js')
      ),
      name: 'pay-refund',
    },
    '/pay/pay-refund-check': {
      //付款退款复核
      component: dynamicWrapper(app, [], () =>
        import('containers/pay/pay-refund/pay-refund-check-query.js')
      ),
      name: 'pay-refund-check',
    },
    '/pay/pay-backlash/:tab': {
      //付款反冲
      component: dynamicWrapper(app, [], () =>
        import('containers/pay/payment-backlash/pay-backlash.js')
      ),
      name: 'pay-backlash',
    },
    '/pay/pay-backlash-recheck/:tab': {
      //付款反冲复核
      component: dynamicWrapper(app, [], () =>
        import('containers/pay/payment-backlash-recheck/pay-backlash-recheck.js')
      ),
      name: 'pay-backlash-recheck',
    },
    '/approval-management/approval-my-reimburse': {
      //报账单审批
      component: dynamicWrapper(app, [], () =>
        import('containers/reimburse/reimburse-approve/my-reimburse.js')
      ),
      name: 'approval-my-reimburse',
    },
    '/approval-management/approve-my-reimburse/approve-reimburse-detail/:id/:entityOID/:flag': {
      //报账单审批详情
      component: dynamicWrapper(app, [], () =>
        import('containers/reimburse/reimburse-approve/reimburse-detail.js')
      ),
      name: 'approve-reimburse-detail',
      parent: '/approval-management/approval-my-reimburse',
    },
    //预算日记账复核
    '/budget/budget-journal-re-check': {
      component: dynamicWrapper(app, [], () =>
        import('containers/budget/budget-journal-re-check/budget-journal-re-check.js')
      ),
      name: 'budget-journal-re-check',
    },

    //预算日记账复核详情
    '/budget/budget-journal-re-check/budget-journal-re-check-detail/:journalCode': {
      component: dynamicWrapper(app, [], () =>
        import('containers/budget/budget-journal-re-check/budget-journal-re-check-detail.js')
      ),
      name: 'budget-journal-re-check-detail',
      parent: '/budget/budget-journal-re-check',
    },
    //账套设置
    '/finance-setting/set-of-books': {
      component: dynamicWrapper(app, [], () =>
        import('containers/finance-setting/set-of-books/set-of-books.js')
      ),
      name: 'set-of-books',
    },
    '/admin-setting/department-group': {
      //部门组
      component: dynamicWrapper(app, [], () =>
        import('containers/setting/department-group/department-group.js')
      ),
      name: 'department-group',
    },
    '/admin-setting/department-group/new-department-group': {
      //新建部门组
      component: dynamicWrapper(app, [], () =>
        import('containers/setting/department-group/new-department-group.js')
      ),
      name: 'new-department-group',
      parent: '/admin-setting/department-group',
    },
    '/admin-setting/department-group/department-group-detail/:id': {
      //部门组详情
      component: dynamicWrapper(app, [], () =>
        import('containers/setting/department-group/department-group-detail.js')
      ),
      name: 'department-group-detail',
      parent: '/admin-setting/department-group',
    },
    '/finance-setting/account-period-control': {
      //会计期间控制
      component: dynamicWrapper(app, [], () =>
        import('containers/finance-setting/account-period-control/account-period-control.js')
      ),
      name: 'account-period-control',
    },
    '/finance-setting/account-period-control/account-period-detail/:periodSetId/:setOfBooksId': {
      //会计期间信息详情
      component: dynamicWrapper(app, [], () =>
        import('containers/finance-setting/account-period-control/account-period-detail.js')
      ),
      name: 'account-period-detail',
      parent: '/finance-setting/account-period-control',
    },
    '/admin-setting/subject-sheet': {
      //科目表定义
      component: dynamicWrapper(app, [], () =>
        import('containers/setting/subject-sheet/subject-sheet.js')
      ),
      name: 'subject-sheet',
    },
    '/admin-setting/subject-sheet/subject-sheet-detail/:accountSetId': {
      //科目表详情
      component: dynamicWrapper(app, [], () =>
        import('containers/setting/subject-sheet/subject-sheet-detail.js')
      ),
      name: 'subject-sheet-detail',
      parent: '/admin-setting/subject-sheet',
    },
    //币种设置
    '/admin-setting/currency-setting/:setOfBooksId/:functionalCurrencyCode/:functionalCurrencyName': {
      component: dynamicWrapper(app, [], () =>
        import('containers/setting/currency-setting/currency-setting.js')
      ),
      name: 'currency-setting',
    },
    //新增汇率
    '/admin-setting/currency-setting/currency-setting-add/:baseCurrency/:baseCurrencyName/:setOfBooksId/:tenantId/:enableAutoUpdate': {
      component: dynamicWrapper(app, [], () =>
        import('containers/setting/currency-setting/currency-setting-add.js')
      ),
      name: 'currency-setting-add',
      parent: '/admin-setting/currency-setting/:setOfBooksId/:functionalCurrencyCode/:functionalCurrencyName',
    },
    //编辑汇率
    '/admin-setting/currency-setting/currency-setting-edit/:enableAutoUpdate/:currencyRateOid/:functionalCurrencyName/:functionalCurrencyCode/:setOfBooksId': {
      component: dynamicWrapper(app, [], () =>
        import('containers/setting/currency-setting/currency-setting-edit.js')
      ),
      name: 'currency-setting-edit',
      parent: '/admin-setting/currency-setting/:setOfBooksId/:functionalCurrencyCode/:functionalCurrencyName',
    },
    //实体法人
    '/enterprise-manage/legal-person': {
      component: dynamicWrapper(app, [], () =>
        import('containers/enterprise-manage/legal-person/legal-person.js')
      ),
      name: 'legal-person',
    },
    //实体法人详情
    '/enterprise-manage/legal-person/legal-person-detail/:legalPersonOID/:legalPersonID': {
      component: dynamicWrapper(app, [], () =>
        import('containers/enterprise-manage/legal-person/legal-person-detail.js')
      ),
      name: 'legal-person-detail',
      parent: '/enterprise-manage/legal-person',
    },
    //编辑实体法人
    '/enterprise-manage/legal-person/new-legal-person/:legalPersonOID/:legalPersonID': {
      component: dynamicWrapper(app, [], () =>
        import('containers/enterprise-manage/legal-person/new-legal-person.js')
      ),
      name: 'new-legal-person',
      parent: '/enterprise-manage/legal-person',
    },
    //预算审核
    '/approval-management/budget-journal-check': {
      component: dynamicWrapper(app, [], () =>
        import('containers/approve/budget-journal-check/budget-journal-check.js')
      ),
      name: 'budget-journal-check',
    },
    //预算审核详情
    '/approval-management/budget-journal-check/budget-journal-check-detail/:id/:journalCode/:flag': {
      component: dynamicWrapper(app, [], () =>
        import('containers/approve/budget-journal-check/budget-journal-check-detail.js')
      ),
      name: 'budget-journal-check-detail',
      parent: '/approval-management/budget-journal-check',
    },
    //会计期间定义
    '/finance-setting/account-period-define': {
      component: dynamicWrapper(app, [], () =>
        import('containers/finance-setting/account-period-define/account-period-define.js')
      ),
      name: 'account-period-define',
    },
    //企业管理-公司维护
    '/enterprise-manage/company-maintain': {
      component: dynamicWrapper(app, [], () =>
        import('containers/enterprise-manage/company-maintain/company-maintain.js')
      ),
      name: 'company-maintain',
    },
    //企业管理-公司维护-新建编辑公司
    '/enterprise-manage/company-maintain/new-company-maintain/:flag/:companyOID': {
      component: dynamicWrapper(app, [], () =>
        import('containers/enterprise-manage/company-maintain/new-company-maintain.js')
      ),
      name: 'new-company-maintain',
      parent: '/enterprise-manage/company-maintain',
    },
    //企业管理-公司维护-详情
    '/enterprise-manage/company-maintain/company-maintain-detail/:companyOId/:companyId': {
      component: dynamicWrapper(app, [], () =>
        import('containers/enterprise-manage/company-maintain/company-maintain-detail.js')
      ),
      name: 'company-maintain-detail',
      parent: '/enterprise-manage/company-maintain',
    },
    //企业管理-公司维护-公司详情-编辑银行账户
    '/enterprise-manage/company-maintain/edit-bank-account/:companyOId/:companyId/:flag': {
      component: dynamicWrapper(app, [], () =>
        import('containers/enterprise-manage/company-maintain/new-bank-account.js')
      ),
      name: 'edit-bank-account',
      parent: '/enterprise-manage/company-maintain',
    },
    '/admin-setting/company-level-define': {
      component: dynamicWrapper(app, [], () =>
        import('containers/setting/company-level-define/company-level-define.js')
      ),
      name: 'company-level-define',
    },
    //设置-公告信息
    '/admin-setting/announcement-information': {
      component: dynamicWrapper(app, [], () =>
        import('containers/setting/announcement-information/announcement-information.js')
      ),
      name: 'announcement-information',
    },
    //设置-新建公告信息
    '/admin-setting/announcement-information/new-announcement-information': {
      component: dynamicWrapper(app, [], () =>
        import('containers/setting/announcement-information/announcement-information-detail.js')
      ),
      parent: '/admin-setting/announcement-information',
      name: 'new-announcement-information',
    },
    //设置-公告信息-详情
    '/admin-setting/announcement-information/announcement-information-detail/:OID/:id': {
      component: dynamicWrapper(app, [], () =>
        import('containers/setting/announcement-information/announcement-information-detail.js')
      ),
      parent: '/admin-setting/announcement-information',
      name: 'announcement-information-detail',
    },
    //组织架构
    '/enterprise-manage/org-structure': {
      component: dynamicWrapper(app, [], () =>
        import('containers/enterprise-manage/org-structure/org-structure.js')
      ),
      name: 'org-structure',
    },
    //部门角色
    '/enterprise-manage/org-structure/org-roles-list': {
      component: dynamicWrapper(app, [], () =>
        import('containers/enterprise-manage/org-structure/org-component/org-roles-list.js')
      ),
      name: 'org-roles-list',
      parent: '/enterprise-manage/org-structure',
    },
    '/admin-setting/person-group': {
      //人员组
      component: dynamicWrapper(app, [], () =>
        import('containers/setting/person-group/person-group.js')
      ),
      name: 'person-group',
    },
    '/admin-setting/person-group/new-person-group': {
      //新建人员组
      component: dynamicWrapper(app, [], () =>
        import('containers/setting/person-group/new-person-group.js')
      ),
      name: 'new-person-group',
      parent: '/admin-setting/person-group',
    },
    '/admin-setting/person-group/edit-person-group/:id': {
      //编辑人员组
      component: dynamicWrapper(app, [], () =>
        import('containers/setting/person-group/new-person-group.js')
      ),
      name: 'new-person-group',
      parent: '/admin-setting/person-group',
    },
    '/admin-setting/person-group/person-group-detail/:id': {
      //人员组详情
      component: dynamicWrapper(app, [], () =>
        import('containers/setting/person-group/person-group-detail.js')
      ),
      name: 'person-group-detail',
      parent: '/admin-setting/person-group',
    },
    //安全设置
    '/admin-setting/security-setting': {
      component: dynamicWrapper(app, [], () =>
        import('containers/setting/security-setting/security-setting.js')
      ),
      name: 'security-setting',
    },

    '/admin-setting/cost-center/:setOfBooksId': {
      //成本中心
      component: dynamicWrapper(app, [], () =>
        import('containers/setting/cost-center/cost-center.js')
      ),
      name: 'cost-center',
    },
    '/admin-setting/cost-center/new-cost-center/:id/:setOfBooksId': {
      //新增成本中心
      component: dynamicWrapper(app, [], () =>
        import('containers/setting/cost-center/new-cost-center.js')
      ),
      name: 'new-cost-center',
      parent: '/admin-setting/cost-center/:setOfBooksId',
    },
    '/admin-setting/cost-center/cost-center-detail/:id/:setOfBooksId': {
      //成本中心详情
      component: dynamicWrapper(app, [], () =>
        import('containers/setting/cost-center/cost-center-detail.js')
      ),
      name: 'cost-center-detail',
      parent: '/admin-setting/cost-center/:setOfBooksId',
    },
    '/admin-setting/cost-center/cost-center-detail/cost-center-item/cost-center-item-detail/:id/:itemId/:setOfBooksId': {
      //成本中心项详情
      component: dynamicWrapper(app, [], () =>
        import('containers/setting/cost-center/cost-center-item/cost-center-item-detail.js')
      ),
      name: 'cost-center-item-detail',
      parent: '/admin-setting/cost-center/cost-center-detail/:id/:setOfBooksId',
    },
    '/admin-setting/cost-center/cost-center-detail/cost-center-item/new-cost-center-item/:id/:itemId/:setOfBooksId': {
      //新增成本中心项:编辑成本中心项
      component: dynamicWrapper(app, [], () =>
        import('containers/setting/cost-center/cost-center-item/new-cost-center-item.js')
      ),
      name: 'new-cost-center-item',
      parent: '/admin-setting/cost-center/cost-center-detail/:id/:setOfBooksId',
    },
    '/admin-setting/cost-center/cost-center-extend-filed/:setOfBooksId': {
      //成本中心扩展字段
      component: dynamicWrapper(app, [], () =>
        import('containers/setting/cost-center/cost-center-extend-filed/cost-center-extend-filed.js')
      ),
      name: 'cost-center-extend-filed',
      parent: '/admin-setting/cost-center/:setOfBooksId',
    },

    '/approval-management/approve-payment-requisition': {
      component: dynamicWrapper(app, [], () =>
        import('containers/approve/payment-requisition/payment-requisition.js')
      ),
      // 付款申请单审批
      name: 'approve-payment-requisition',
    },
    '/admin-setting/new-expense-type/:expenseTypeId': {
      component: dynamicWrapper(app, [], () =>
        import('containers/setting/expense-type/new-expense-type/new-expense-type.js')
      ),
      name: 'new-expense-type',
      parent: '/admin-setting/expense-type',
    },
    '/admin-setting/expense-type-detail/:expenseTypeId': {
      component: dynamicWrapper(app, [], () =>
        import('containers/setting/expense-type/new-expense-type/new-expense-type.js')
      ),
      // 付款申请单审批详情
      name: 'expense-type-detail',
      parent: '/admin-setting/expense-type',
    },
    //员工管理
    '/setting/employee/person-detail/person-detail/:userOID': {
      component: dynamicWrapper(app, [], () =>
        import('containers/enterprise-manage/person-manage/person-detail/person-detail.js')
      ),
      name: 'person-detail',
      parent: '/setting/employee',
    },
    '/financial-management/expense-reverse': {
      //财务管理-费用反冲
      component: dynamicWrapper(app, [], () =>
        import('containers/financial-management/expense-reverse/expense-reverse.js')
      ),
      name: 'expense-reverse',
    },
    //财务管理 - 费用反冲单审核详情
    '/financial-management/exp-report-reverse-check/exp-report-reverse-check-detail/:id/:tab': {
      component: dynamicWrapper(app, [], () =>
        import('containers/financial-management/exp-report-reverse-check/exp-report-reverse-check-detail.js')
      ),
      name: 'exp-report-reverse-check-detail',
      parent: '/financial-management/exp-report-reverse-check/:tab',
    },
    //核销反冲复核
    '/financial-management/csh-write-off-backlash-check': {
      component: dynamicWrapper(app, [], () =>
        import('containers/financial-management/csh-write-off-backlash-check/csh-write-off-backlash-check.js')
      ),
      name: 'csh-write-off-backlash-check',
    },

    '/financial-management/check-cost-application': {
      //费用申请查看
      component: dynamicWrapper(app, [], () =>
        import('containers/financial-management/check-cost-application/check-cost-application')
      ),
      name: 'check-cost-application',
    },
    //财务查询-预付款单财务查询
    '/financial-view/pre-payment-view': {
      component: dynamicWrapper(app, [], () =>
        import('containers/financial-view/pre-payment-view/pre-payment-view.js')
      ),
      name: 'pre-payment-view',
      // parent: '/financial-view',
    },
    //财务查询-预付款详情
    '/pre-payment/my-pre-payment/pre-payment-detail/:id/:flag': {
      component: dynamicWrapper(app, [], () =>
        import('containers/pre-payment/my-pre-payment/pre-payment-detail.js')
      ),
      name: 'pre-payment-detail',
      parent: '/financial-view/pre-payment-view',
    },
    //报销单
    '/expense-report': {
      component: dynamicWrapper(app, [], () =>
        import('containers/expense-report/expense-report.js')
      ),
      name: 'expense-report',
    },
    //新建报销单
    '/expense-report/new-expense-report/:formId/:userOID': {
      component: dynamicWrapper(app, [], () =>
        import('containers/expense-report/new-expense-report.js')
      ),
      name: 'new-expense-report',
      parent: '/expense-report',
    },
    //报销单详情
    '/expense-report/expense-report-detail/:expenseReportOID/:pageFrom': {
      component: dynamicWrapper(app, [], () =>
        import('containers/expense-report/base-expense-report-detail.js')
      ),
      name: 'base-expense-report-detail',
      parent: '/expense-report',
    },
    //报销单审批
    '/approval-management/approve-expense-report': {
      //费用调整单审批
      component: dynamicWrapper(app, [], () =>
        import('containers/expense-report/expense-report-approve/approve-expense-report')
      ),
      name: 'approve-expense-report',
    },
    //审批报销单审批详情
    '/approval-management/approve-expense-report/approve-expense-report-detail/:expenseReportOID/:approverOID': {
      component: dynamicWrapper(app, [], () =>
        import('containers/expense-report/base-expense-report-detail.js')
      ),
      name: 'approve-expense-report-detail',
      parent: '/approval-management/approve-expense-report',
    },
    //单据查看
    '/financial-management/finance-view': {
      component: dynamicWrapper(app, [], () =>
        import('containers/financial-management/finance-view/finance-view')
      ),
      name: 'finance-view',
    },
    //借款单详情
    '/financial-management/finance-view/loan-request-detail-view/:formOID/:applicationOID': {
      component: dynamicWrapper(app, [], () => import('containers/request/base-request-detail')),
      name: 'loan-request-detail-audit',
      parent: '/financial-management/finance-view',
    },
    //查看单据-报销单详情
    '/financial-management/finance-view/expense-report-detail-view/:expenseReportOID': {
      component: dynamicWrapper(app, [], () =>
        import('containers/expense-report/base-expense-report-detail.js')
      ),
      name: 'base-expense-report-detail',
      parent: '/financial-management/finance-view',
    },
    //财务查询-对公报账单
    '/financial-view/public-reimburse-report': {
      component: dynamicWrapper(app, [], () =>
        import('containers/financial-view/public-reimburse-report/public-reimburse-report.js')
      ),
      name: 'public-reimburse-report',
      parent: '/financial-view',
    },
    //我的账本
    '/my-account': {
      component: dynamicWrapper(app, [], () => import('containers/my-account/my-account.js')),
      name: 'my-account',
    },
    '/approval-management/approve-payment-requisition/payment-requisition-detail/:id/:entityOID/:flag': {
      component: dynamicWrapper(app, [], () =>
        import('containers/approve/payment-requisition/payment-requisition-detail.js')
      ),
      // 付款申请单审批详情
      name: 'approve-payment-requisition-detail',
      parent: '/approval-management/approve-payment-requisition',
    },
    '/financial-view/accounting-view': {
      //会计分录查询
      component: dynamicWrapper(app, [], () =>
        import('containers/financial-view/accounting-view/accounting-view')
      ),
      name: 'accounting-view.',
    },
    //财务管理 - 费用反冲单审核
    '/financial-management/exp-report-reverse-check/:tab': {
      component: dynamicWrapper(app, [], () =>
        import('containers/financial-management/exp-report-reverse-check/exp-report-reverse-check.js')
      ),
      name: 'exp-report-reverse-check',
    },
    //企业管理-公司维护-公司详情-新建银行账户
    '/enterprise-manage/company-maintain/new-bank-account/:companyOId/:companyId/:flag': {
      component: dynamicWrapper(app, [], () =>
        import('containers/enterprise-manage/company-maintain/new-bank-account.js')
      ),
      name: 'new-bank-account',
      parent: '/enterprise-manage/company-maintain',
    },
    //数据权限
    '/admin-setting/data-authority': {
      component: dynamicWrapper(app, [], () =>
        import('containers/setting/data-authority/data-authority.js')
      ),
      name: 'data-authority',
    },
    '/financial-management/expense-reverse/new-reverse/:id/:businessClass/:isNew/:currency': {
      //财务管理-费用反冲-新建反冲
      component: dynamicWrapper(app, [], () =>
        import('containers/financial-management/expense-reverse/new-reverse.js')
      ),
      name: 'new-reverse',
      parent: '/financial-management/expense-reverse'
    },
    '/financial-management/expense-reverse/expense-reverse-detail/:id': {
      //财务管理-费用反冲-详情
      component: dynamicWrapper(app, [], () =>
        import('containers/financial-management/expense-reverse/expense-reverse-detail.js')
      ),
      name: 'expense-reverse-detail',
      parent: '/financial-management/expense-reverse'
    },
    '/admin-setting/new-application-type/:applicationTypeId': {
      component: dynamicWrapper(app, [], () =>
        import('containers/setting/expense-type/new-application-type/new-application-type.js')
      ),
      name: 'new-application-type',
      parent: '/admin-setting/expense-type'
    },
    //报销单详情
    '/financial-management/finance-audit/expense-report-detail-audit/:expenseReportOID/:backType': {
      component: dynamicWrapper(app, [], () =>
        import('containers/expense-report/base-expense-report-detail.js')
      ),
      name: 'expense-report-detail-audit',
      parent: '/financial-management/finance-audit'
    },
    //借款单详情
    '/financial-management/finance-audit/loan-request-detail-audit/:formOID/:applicationOID/:backType': {
      component: dynamicWrapper(app, [], () =>
        import('containers/request/base-request-detail.js')
      ),
      name: 'loan-request-detail-audit',
      parent: '/financial-management/finance-audit'
    },

    '/financial-management/check-cost-application/cost-application-detail/:formOID/:applicationOID': {
      //费用申请单详情
      component: dynamicWrapper(app, [], () =>
        import('containers/request/base-request-detail')
      ),
      name: 'cost-application-detail',
      parent: '/financial-management/check-cost-application'
    },

    // '/user/:id': {
    //   component: dynamicWrapper(app, [], () => import('../routes/User/SomeComponent')),
    // },
  };
  // Get name from ./menu.js or just set it in the router data.
  const menuData = getFlatMenuData(getMenuData());

  // Route configuration data
  // eg. {name,authority ...routerConfig }
  const routerData = {};
  // The route matches the menu
  Object.keys(routerConfig).forEach(path => {
    // Regular match item name
    // eg.  router /user/:id === /user/chen
    const pathRegexp = pathToRegexp(path);
    const menuKey = Object.keys(menuData).find(key => pathRegexp.test(`${key}`));
    let menuItem = {};
    // If menuKey is not empty
    if (menuKey) {
      menuItem = menuData[menuKey];
    }
    let router = routerConfig[path];
    // If you need to configure complex parameter routing,
    // https://github.com/ant-design/ant-design-pro-site/blob/master/docs/router-and-nav.md#%E5%B8%A6%E5%8F%82%E6%95%B0%E7%9A%84%E8%B7%AF%E7%94%B1%E8%8F%9C%E5%8D%95
    // eg . /list/:type/user/info/:id

    router = {
      ...router,
      name: router.name || menuItem.name,
      authority: router.authority || menuItem.authority,
      hideInBreadcrumb: router.hideInBreadcrumb || menuItem.hideInBreadcrumb,
    };
    routerData[path] = router;
  });
  return routerData;
};
