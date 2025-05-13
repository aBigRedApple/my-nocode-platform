import React, { useEffect } from "react";
import { Modal, Form, Input, Button } from "antd";
import { LockOutlined } from "@ant-design/icons";
import axios from "@/utils/axios";
import { NextRouter } from "next/router";
import { toast } from 'sonner';

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: (callback: () => Promise<void>) => void;
  logout: () => void;
  router: NextRouter;
}

const ChangePasswordModal: React.FC<Props> = ({ visible, onClose, onConfirm, logout, router }) => {
  const [form] = Form.useForm();

  // 每次打开 Modal 时清空表单
  useEffect(() => {
    if (visible) {
      form.resetFields();
    }
  }, [visible, form]);

  const handleChangePassword = async () => {
    try {
      const { newPassword } = form.getFieldsValue();

      onConfirm(async () => {
        try {
          await axios.put("/api/user/password", { password: newPassword });
          toast.success('密码已修改', {
            description: '请使用新密码重新登录',
          });
          onClose(); // 请求成功后关闭修改密码框
          logout();
          router.push("/auth/login");
        } catch (error: unknown) {
          const axiosError = error as { response?: { data?: { message?: string } } };
          toast.error('修改失败', {
            description: axiosError?.response?.data?.message || "修改密码失败，请重试",
          });
          throw error; // 抛出错误以防止后续逻辑执行
        }
      });
    } catch {
      toast.error('验证失败', {
        description: '请检查输入的新密码是否符合要求',
      });
    }
  };

  return (
    <Modal title="修改密码" open={visible} onCancel={onClose} footer={null}>
      <Form form={form} layout="vertical" onFinish={handleChangePassword}>
        <Form.Item
          name="newPassword"
          rules={[
            { required: true, message: "请输入新密码" },
            { min: 6, message: "密码长度至少6个字符" },
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="请输入新密码" />
        </Form.Item>
        <Form.Item
          name="confirmPassword"
          dependencies={["newPassword"]}
          rules={[
            { required: true, message: "请确认新密码" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) return Promise.resolve();
                return Promise.reject(new Error("两次输入的密码不一致"));
              },
            }),
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="请确认新密码" />
        </Form.Item>
        <Form.Item>
          <div className="flex justify-end gap-4">
            <Button onClick={onClose}>取消</Button>
            <Button type="primary" htmlType="submit">
              确认修改
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ChangePasswordModal;