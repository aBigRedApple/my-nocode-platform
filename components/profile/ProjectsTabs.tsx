// components/profile/ProjectsTabs.tsx
import React, { useState } from "react";
import { Tabs, Button, Skeleton, Empty, Modal } from "antd";
import { ProjectOutlined, AppstoreOutlined } from "@ant-design/icons";
import ProjectItem from "./ProjectItem";
import axios from "@/utils/axios";
import { toast } from "react-toastify";
import { NextRouter } from "next/router";

interface Project {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface Template {
  id: number;
  name: string;
  description: string | null;
  layoutId: number | null;
}

interface Props {
  loading: boolean;
  projects: Project[];
  templates: Template[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  router: NextRouter;
}

const ProjectsTabs: React.FC<Props> = ({ loading, projects, templates, setProjects, router }) => {
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<number | null>(null);

  const handleDeleteProject = async (id: number) => {
    try {
      await axios.delete(`/api/layouts/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setProjects(projects.filter((project) => project.id !== id));
      toast.success("项目已删除");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "删除项目失败，请重试");
    }
  };

  const showDeleteConfirm = (id: number) => {
    setProjectToDelete(id);
    setIsDeleteModalVisible(true);
  };

  const handleConfirmDelete = () => {
    if (projectToDelete !== null) {
      handleDeleteProject(projectToDelete);
      setIsDeleteModalVisible(false);
      setProjectToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalVisible(false);
    setProjectToDelete(null);
  };

  return (
    <div className="flex-1 p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
      <Tabs
        defaultActiveKey="projects"
        items={[
          {
            key: "projects",
            label: (
              <span className="flex items-center gap-2">
                <ProjectOutlined />
                我的项目
              </span>
            ),
            children: (
              <div className="flex flex-col h-full">
                <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 pb-4">
                  <Button
                    type="dashed"
                    className="w-full h-16 text-lg"
                    onClick={() => router.push("/workspace")}
                  >
                    + 新建项目
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto" style={{ maxHeight: "calc(100vh - 300px)" }}>
                  {loading ? (
                    <Skeleton active paragraph={{ rows: 6 }} />
                  ) : projects.length > 0 ? (
                    <div className="grid gap-4">
                      {projects.map((project) => (
                        <ProjectItem
                          key={project.id}
                          project={project}
                          onEdit={() => router.push(`/editor/${project.id}`)}
                          onDelete={() => showDeleteConfirm(project.id)} // 修改为显示确认框
                        />
                      ))}
                    </div>
                  ) : (
                    <Empty description="暂无项目" />
                  )}
                </div>
              </div>
            ),
          },
          {
            key: "templates",
            label: (
              <span className="flex items-center gap-2">
                <AppstoreOutlined />
                我的模板
              </span>
            ),
            children: (
              <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto" style={{ maxHeight: "calc(100vh - 200px)" }}>
                  {loading ? (
                    <Skeleton active paragraph={{ rows: 6 }} />
                  ) : templates.length > 0 ? (
                    <div className="grid gap-4">
                      {templates.map((template) => (
                        <div key={template.id} className="p-4 border rounded-lg">
                          <h3 className="font-semibold">{template.name}</h3>
                          <p className="text-sm text-gray-500">{template.description || "暂无描述"}</p>
                          <Button
                            type="primary"
                            size="small"
                            onClick={() => router.push(`/template/${template.id}`)}
                          >
                            查看
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Empty description="暂无收藏模板" />
                  )}
                </div>
              </div>
            ),
          },
        ]}
      />

      {/* 删除确认模态框 */}
      <Modal
        title="确认删除"
        open={isDeleteModalVisible}
        onOk={handleConfirmDelete}
        onCancel={handleCancelDelete}
        okText="确认"
        cancelText="取消"
        okButtonProps={{ danger: true }}
      >
        <p>确定要删除此项目吗？此操作不可撤销。</p>
      </Modal>
    </div>
  );
};

export default ProjectsTabs;