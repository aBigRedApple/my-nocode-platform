// components/profile/EditUserModal.tsx
import React from "react";
import { Modal, Form, Input, Button } from "antd";
import { UserOutlined, MailOutlined } from "@ant-design/icons";
import axios from "@/utils/axios";
import { toast } from 'sonner';

interface UserInfo {
  name: string;
  email: string;
}

interface Props {
  visible: boolean;
  userInfo: UserInfo;
  setUserInfo: React.Dispatch<React.SetStateAction<UserInfo>>;
  onClose: () => void;
  refreshUserState: () => void;
}

const EditUserModal: React.FC<Props> = ({ visible, userInfo, setUserInfo, onClose, refreshUserState }) => {
  const [form] = Form.useForm();

  const handleEditInfo = async (values: UserInfo) => {
    try {
      await axios.put("/api/user/profile", values);
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const updatedUser = { ...storedUser, ...values };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUserInfo(values);
      onClose();
      toast.success('个人信息已更新', {
        description: '您的个人信息已成功更新',
      });
      refreshUserState();
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      toast.error('更新失败', {
        description: axiosError?.response?.data?.message || "更新个人信息失败，请重试",
      });
    }
  };

  return (
    <Modal title="编辑个人信息" open={visible} onCancel={onClose} footer={null}>
      <Form form={form} onFinish={handleEditInfo} layout="vertical" initialValues={userInfo}>
        <Form.Item name="name" rules={[{ required: true, message: "请输入姓名" }]}>
          <Input prefix={<UserOutlined />} placeholder="请输入姓名" />
        </Form.Item>
        <Form.Item name="email" rules={[{ required: true, type: "email", message: "请输入有效邮箱" }]}>
          <Input prefix={<MailOutlined />} placeholder="请输入邮箱" />
        </Form.Item>
        <Form.Item>
          <div className="flex justify-end gap-4">
            <Button onClick={onClose}>取消</Button>
            <Button type="primary" htmlType="submit">
              保存更改
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditUserModal;