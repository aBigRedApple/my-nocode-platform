"use client";

import React, { useState } from "react";
import { Button, Modal } from "antd";
import { EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";

interface Project {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  preview?: string;
}

interface Props {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
}

const ProjectItem: React.FC<Props> = ({ project, onEdit, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  console.log("ProjectItem received project:", project); // 调试日志

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex justify-between items-center gap-4">
        {/* 项目信息 */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-800 truncate">{project.name}</h3>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {project.description || "无描述"}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            创建时间: {project.createdAt} | 更新时间: {project.updatedAt}
          </p>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-2">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={onEdit}
          >
            编辑
          </Button>
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={onDelete}
          >
            删除
          </Button>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={showModal}
            disabled={!project.preview}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md border-none"
          >
            预览
          </Button>
        </div>
      </div>

      {/* 预览 Modal */}
      <Modal
        title={
          <span className="text-lg font-semibold text-gray-800">
            {project.name} - 预览
          </span>
        }
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <Button
            key="close"
            onClick={handleCancel}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md border-none"
          >
            关闭
          </Button>,
        ]}
        width={600}
        centered
        styles={{
          body: { padding: "16px", background: "#fafafa" }, // 替换 bodyStyle
        }}
      >
        {project.preview ? (
          <div className="flex justify-center">
            <img
              src={project.preview}
              alt={`${project.name} preview`}
              className="max-w-full h-auto rounded-lg shadow-sm"
              style={{ maxHeight: "400px" }}
              onError={(e) => console.error("Image load error:", project.preview)}
            />
          </div>
        ) : (
          <p className="text-center text-gray-500">暂无预览图</p>
        )}
      </Modal>
    </div>
  );
};

export default ProjectItem;