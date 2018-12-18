import React from 'react';
import { Tag } from 'antd';

export default {
  status: (value) => {
    return !value ? <Tag color="red">禁用</Tag> : <Tag color="green">启用</Tag>;
  },
};
