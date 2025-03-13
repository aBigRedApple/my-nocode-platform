"use client";

import React, { useState, useEffect } from "react";
import { Tabs, Button, Skeleton, Empty, Modal } from "antd";
import { ProjectOutlined, AppstoreOutlined, DeleteOutlined } from "@ant-design/icons";
import ProjectItem from "./ProjectItem";
import axios from "@/utils/axios";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

interface Project {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  preview?: string; // 添加 preview
}

interface Template {
  id: number;
  name: string;
  description: string | null;
  thumbnail?: string | null;
  category: string;
}

interface Props {
  loading: boolean;
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  templates: Template[];
  router: ReturnType<typeof useRouter>;
}

const ProjectsTabs: React.FC<Props> = ({ loading, projects, setProjects, templates: initialTemplates, router }) => {
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<number | null>(null);
  const [templates, setTemplates] = useState<Template[]>(initialTemplates);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [isTemplateDeleteModalVisible, setIsTemplateDeleteModalVisible] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<number | null>(null);

  // 获取收藏的模板
  const fetchFavorites = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.info("请登录后查看收藏模板");
      router.push("/auth/login");
      return;
    }

    setTemplatesLoading(true);
    try {
      const response = await axios.get("/api/favorites/templates", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTemplates(response.data.templates || []);
    } catch (error) {
      console.error("获取收藏模板失败:", error);
      toast.error("无法加载收藏模板，请稍后重试");
      setTemplates([]);
    } finally {
      setTemplatesLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

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

  const handleDeleteTemplate = async (id: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.info("请登录后操作");
      return;
    }

    try {
      await axios.post(
        "/api/favorites",
        { templateId: id, action: "remove" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTemplates(templates.filter((template) => template.id !== id));
      toast.success("已取消收藏");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "取消收藏失败，请重试");
    }
  };

  const showTemplateDeleteConfirm = (id: number) => {
    setTemplateToDelete(id);
    setIsTemplateDeleteModalVisible(true);
  };

  const handleConfirmTemplateDelete = () => {
    if (templateToDelete !== null) {
      handleDeleteTemplate(templateToDelete);
      setIsTemplateDeleteModalVisible(false);
      setTemplateToDelete(null);
    }
  };

  const handleCancelTemplateDelete = () => {
    setIsTemplateDeleteModalVisible(false);
    setTemplateToDelete(null);
  };

  const handleEdit = async (projectId: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("请先登录");
        router.push("/auth/login");
        return;
      }

      const response = await axios.get(`/api/layouts/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        console.log("跳转到编辑页面:", `/editor/${projectId}`);
        router.replace(`/editor/${projectId}`);
      } else {
        toast.error("无法访问该项目");
      }
    } catch (error) {
      console.error("编辑项目时出错:", error);
      toast.error("无法编辑该项目，请重试");
    }
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
                          onEdit={() => handleEdit(project.id)}
                          onDelete={() => showDeleteConfirm(project.id)}
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
                我收藏的模板
              </span>
            ),
            children: (
              <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto" style={{ maxHeight: "calc(100vh - 200px)" }}>
                  {templatesLoading ? (
                    <Skeleton active paragraph={{ rows: 6 }} />
                  ) : templates.length > 0 ? (
                    <div className="grid gap-4">
                      {templates.map((template) => (
                        <div key={template.id} className="p-4 border rounded-lg flex items-center gap-4">
                          {template.thumbnail && (
                            <img
                              src={template.thumbnail}
                              alt={template.name}
                              className="w-24 h-16 object-cover rounded"
                            />
                          )}
                          <div className="flex-1">
                            <h3 className="font-semibold">{template.name}</h3>
                            <p className="text-sm text-gray-500">{template.description || "暂无描述"}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="default"
                              size="small"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => showTemplateDeleteConfirm(template.id)}
                            >
                              删除
                            </Button>
                          </div>
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

      <Modal
        title="确认删除项目"
        open={isDeleteModalVisible}
        onOk={handleConfirmDelete}
        onCancel={handleCancelDelete}
        okText="确认"
        cancelText="取消"
        okButtonProps={{ danger: true }}
      >
        <p>确定要删除此项目吗？此操作不可撤销。</p>
      </Modal>

      <Modal
        title="确认取消收藏"
        open={isTemplateDeleteModalVisible}
        onOk={handleConfirmTemplateDelete}
        onCancel={handleCancelTemplateDelete}
        okText="确认"
        cancelText="取消"
        okButtonProps={{ danger: true }}
      >
        <p>确定要取消收藏此模板吗？</p>
      </Modal>
    </div>
  );
};

export default ProjectsTabs;