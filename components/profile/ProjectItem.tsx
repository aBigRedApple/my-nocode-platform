// components/profile/ProjectItem.tsx
import React from "react";
import { Button } from "antd";

interface Project {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface Props {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
}

const ProjectItem: React.FC<Props> = ({ project, onEdit, onDelete }) => (
  <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
    <div className="flex justify-between items-start">
      <div>
        <h3 className="font-semibold">{project.name}</h3>
        <p className="text-sm text-gray-500">{project.description}</p>
        <p className="text-sm text-gray-400 mt-1">
          创建时间: {project.createdAt} | 更新时间: {project.updatedAt}
        </p>
      </div>
      <div className="flex gap-2">
        <Button type="primary" size="small" onClick={onEdit}>
          编辑
        </Button>
        <Button danger size="small" onClick={onDelete}>
          删除
        </Button>
      </div>
    </div>
  </div>
);

export default ProjectItem;