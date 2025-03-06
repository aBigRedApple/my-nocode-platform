// components/profile/UserInfoCard.tsx
import React from "react";
import { Skeleton, Button } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";

interface UserInfo {
  name: string;
  email: string;
}

interface Props {
  loading: boolean;
  userInfo: UserInfo;
  onEdit: () => void;
  onChangePassword: () => void;
  onLogout: () => void;
}

const UserInfoCard: React.FC<Props> = ({ loading, userInfo, onEdit, onChangePassword, onLogout }) => (
  <div className="w-full md:w-1/4 p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
    {loading ? (
      <Skeleton active paragraph={{ rows: 4 }} />
    ) : (
      <>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
          <UserOutlined />
          <span>个人信息</span>
        </h2>
        <div className="mb-6 space-y-3">
          <p className="text-gray-600 dark:text-gray-300">
            <span className="font-medium text-gray-800 dark:text-gray-200">姓名：</span>
            {userInfo.name}
          </p>
          <p className="text-gray-600 dark:text-gray-300">
            <span className="font-medium text-gray-800 dark:text-gray-200">邮箱：</span>
            {userInfo.email}
          </p>
        </div>
        <div className="space-y-4">
          <Button type="primary" onClick={onEdit} className="w-full h-10" icon={<UserOutlined />}>
            编辑信息
          </Button>
          <Button onClick={onChangePassword} className="w-full h-10" icon={<LockOutlined />}>
            修改密码
          </Button>
          <Button danger onClick={onLogout} className="w-full h-10">
            退出登录
          </Button>
        </div>
      </>
    )}
  </div>
);

export default UserInfoCard;