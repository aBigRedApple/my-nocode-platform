'use client'
import React, { useState, useEffect, useCallback } from "react";
import { Input, Button, Select, Card, Skeleton, Empty, Pagination, Modal } from "antd";
import { useRouter } from "next/navigation";
import { SearchOutlined, HeartOutlined, HeartFilled } from "@ant-design/icons";
import Image from "next/image";
import axios from "@/utils/axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Template {
  id: number;
  name: string;
  description?: string;
  thumbnail?: string;
  category: string;
  isFavorite?: boolean;
}

const { Option } = Select;

const MarketPlace = () => {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [activeSearchTerm, setActiveSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTemplates, setTotalTemplates] = useState(0);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const pageSize = 8;
  const [originalSearchQuery, setOriginalSearchQuery] = useState("");

  const fetchTemplates = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.info("请登录以访问模板市场");
      router.push("/auth/login");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("/api/templates", {
        page: currentPage,
        pageSize,
        search: activeSearchTerm.trim() || undefined,
        category: category === "all" ? undefined : category,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { templates: templateList, total, searchQuery } = response.data;
      setTemplates(templateList || []);
      setTotalTemplates(total || 0);
      setOriginalSearchQuery(searchQuery || "");
    } catch (error) {
      console.error("获取模板失败:", error);
      toast.error("无法加载模板，请稍后重试");
      setTemplates([]);
      setTotalTemplates(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, activeSearchTerm, category, router]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const executeSearch = () => {
    setActiveSearchTerm(searchValue);
    setCurrentPage(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      executeSearch();
    }
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setCurrentPage(1);
  };

  const handlePreview = (template: Template) => {
    setSelectedTemplate(template);
    setPreviewVisible(true);
  };

  const handleUseTemplate = async (templateId: number) => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.post("/api/layouts", { templateId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { projectId } = response.data;
      toast.success("项目创建成功，即将跳转到编辑器...");
      setPreviewVisible(false);
      setTimeout(() => router.push(`/editor/${projectId}`), 1000);
    } catch (error) {
      console.error("创建项目失败:", error);
      toast.error("创建项目失败，请重试");
    }
  };

  const handleFavorite = async (templateId: number, isFavorite: boolean) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.info("请登录后收藏");
      router.push("/auth/login");
      return;
    }

    try {
      await axios.post("/api/favorites", {
        templateId,
        action: isFavorite ? 'remove' : 'add',
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTemplates(prev =>
        prev.map(template =>
          template.id === templateId ? { ...template, isFavorite: !isFavorite } : template
        )
      );
      toast.success(isFavorite ? '取消收藏成功' : '收藏成功');
    } catch (error) {
      console.error("收藏操作失败:", error);
      toast.error("操作失败，请重试");
    }
  };

  return (
    <div className="flex flex-col bg-gray-100 pt-24 px-4 md:px-8 py-8 h-screen">
      <ToastContainer />
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="多关键词搜索，空格分隔，按回车执行搜索..."
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          value={searchValue}
          prefix={<SearchOutlined />}
          allowClear
          className="w-full sm:w-1/2"
        />
        <Select
          value={category}
          onChange={handleCategoryChange}
          className="w-full sm:w-1/4"
          placeholder="选择分类"
        >
          <Option value="all">所有分类</Option>
          <Option value="business">商业</Option>
          <Option value="personal">个人</Option>
          <Option value="education">教育</Option>
        </Select>
      </div>

      {originalSearchQuery && (
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            {totalTemplates > 0
              ? `找到 ${totalTemplates} 个与 "${originalSearchQuery}" 相关的模板`
              : `没有找到与 "${originalSearchQuery}" 相关的模板`}
          </p>
        </div>
      )}

      <div className="flex-grow overflow-auto mb-6">
        {loading ? (
          <Skeleton active paragraph={{ rows: 8 }} />
        ) : templates.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {templates.map((template) => {
              const isFavorite = template.isFavorite || false;
              return (
                <Card
                  key={template.id}
                  hoverable
                  cover={
                    <Image
                      src={template.thumbnail || "/placeholder.png"}
                      alt={template.name}
                      width={300}
                      height={160}
                      className="object-cover"
                    />
                  }
                  actions={[
                    <Button
                      key="favorite"
                      type="link"
                      onClick={() => handleFavorite(template.id, isFavorite)}
                      icon={isFavorite ? <HeartFilled style={{ color: 'red' }} /> : <HeartOutlined />}
                    >
                      {isFavorite ? '取消收藏' : '收藏'}
                    </Button>,
                    <Button key="preview" type="link" onClick={() => handlePreview(template)}>
                      预览
                    </Button>,
                    <Button key="use" type="primary" onClick={() => handleUseTemplate(template.id)}>
                      使用
                    </Button>,
                  ]}
                >
                  <Card.Meta
                    title={template.name}
                    description={template.description || "暂无描述"}
                  />
                </Card>
              );
            })}
          </div>
        ) : (
          <Empty description="暂无符合条件的模板" />
        )}
      </div>

      {totalTemplates > pageSize && (
        <div className="flex justify-center mb-6">
          <Pagination
            current={currentPage}
            total={totalTemplates}
            pageSize={pageSize}
            onChange={setCurrentPage}
            showSizeChanger={false}
          />
        </div>
      )}

      <Modal
        title={selectedTemplate?.name || "模板预览"}
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={[
          <Button key="back" onClick={() => setPreviewVisible(false)}>
            关闭
          </Button>,
          <Button
            key="use"
            type="primary"
            onClick={() => selectedTemplate && handleUseTemplate(selectedTemplate.id)}
          >
            使用此模板
          </Button>,
        ]}
        width={800}
      >
        {selectedTemplate && (
          <div>
            <Image
              src={selectedTemplate.thumbnail || "/placeholder.png"}
              alt={selectedTemplate.name}
              width={800}
              height={400}
              className="mb-4 object-contain"
            />
            <p>{selectedTemplate.description || "暂无描述"}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MarketPlace;