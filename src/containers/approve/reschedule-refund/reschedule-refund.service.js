import config from 'config';
import httpFetch from 'share/httpFetch';

export default {
  //获取申请单审批列表，finished：true（已审批）、false（待审批），entityType：1001（申请单）、1002（报销单）
  getApproveRescheduleRefundtList(finished, page, size, searchParams) {
    let url = `${
      config.baseUrl
    }/api/approvals/book/task/filters?finished=${finished}&page=${page}&size=${size}`;
    for (let searchName in searchParams) {
      if (searchName === 'formOIDs') {
        searchParams.formOIDs &&
          searchParams.formOIDs.length > 0 &&
          searchParams.formOIDs.map(oid => {
            url += `&formOIDs=${oid}`;
          });
      } else {
        url += searchParams[searchName] ? `&${searchName}=${searchParams[searchName]}` : '';
      }
    }
    return httpFetch.get(url);
  },
};
