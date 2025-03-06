// components/profile/ConfirmModal.tsx
import React from "react";
import { Modal, Button } from "antd";

interface Props {
  visible: boolean;
  title: string;
  content: string;
  onCancel: () => void;
  onConfirm: () => void;
}

const ConfirmModal: React.FC<Props> = ({ visible, title, content, onCancel, onConfirm }) => (
  <Modal
    title={title}
    open={visible}
    onCancel={onCancel}
    footer={[
      <Button key="back" onClick={onCancel}>
        取消
      </Button>,
      <Button key="submit" type="primary" danger onClick={onConfirm}>
        确认
      </Button>,
    ]}
  >
    <p className="py-4">{content}</p>
  </Modal>
);

export default ConfirmModal;