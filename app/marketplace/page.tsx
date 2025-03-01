'use client'
import React, { useState, useEffect, useCallback } from "react";
import { Input, Button, Select, Card, Skeleton, Empty, Pagination, Modal } from "antd";
import { useRouter } from "next/navigation";
import { SearchOutlined } from "@ant-design/icons";
import Image from "next/image";
import axios from "@/utils/axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// 类型定义
interface Template {
  id: number;
  name: string;
  description?: string;
  thumbnail?: string;
  category: string;
}

const { Option } = Select;

const MarketPlace = () => {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState(""); // 搜索输入值
  const [activeSearchTerm, setActiveSearchTerm] = useState(""); // 当前实际用于搜索的值
  const [category, setCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTemplates, setTotalTemplates] = useState(0);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const pageSize = 8;
  const [originalSearchQuery, setOriginalSearchQuery] = useState("");

  // 获取模板数据
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
        search: activeSearchTerm || undefined, // 使用activeSearchTerm而不是searchValue
        category: category === "all" ? undefined : category,
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

  // 当实际搜索词、分页或分类变化时获取模板
  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // 处理搜索输入变化 - 只更新输入框的值，不触发搜索
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value); // 只更新搜索框内容，不触发搜索
  };

  // 执行搜索 - 仅在回车时触发
  const executeSearch = () => {
    setActiveSearchTerm(searchValue); // 更新用于搜索的实际值
    setCurrentPage(1); // 重置为第一页
  };

  // 监听回车键进行搜索
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      executeSearch();
    }
  };

  // 处理分类变化
  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setCurrentPage(1); // 重置分页
  };

  // 预览模板
  const handlePreview = (template: Template) => {
    setSelectedTemplate(template);
    setPreviewVisible(true);
  };

  // 使用模板
  const handleUseTemplate = async (templateId: number) => {
    try {
      const response = await axios.post("/api/layouts", { templateId });
      const { projectId } = response.data;
      toast.success("项目创建成功，即将跳转到编辑器...");
      setPreviewVisible(false);
      setTimeout(() => router.push(`/editor/${projectId}`), 1000);
    } catch (error) {
      console.error("创建项目失败:", error);
      toast.error("创建项目失败，请重试");
    }
  };

  return (
    <div className="flex flex-col bg-gray-100 pt-24 px-4 md:px-8 py-8 h-screen">
      <ToastContainer />
      {/* 搜索和筛选区域 */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="多关键词搜索，空格分隔，按回车执行搜索..."
          onChange={handleSearchChange} // 监听输入变化，但不触发搜索
          onKeyDown={handleKeyDown} // 监听回车键
          value={searchValue} // 绑定到搜索框值
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

      {/* 搜索结果信息 */}
      {originalSearchQuery && (
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            {totalTemplates > 0
              ? `找到 ${totalTemplates} 个与 "${originalSearchQuery}" 相关的模板`
              : `没有找到与 "${originalSearchQuery}" 相关的模板`}
          </p>
        </div>
      )}

      {/* 模板列表 */}
      <div className="flex-grow overflow-auto mb-6">
        {loading ? (
          <Skeleton active paragraph={{ rows: 8 }} />
        ) : templates.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {templates.map((template) => (
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
            ))}
          </div>
        ) : (
          <Empty description="暂无符合条件的模板" />
        )}
      </div>

      {/* 分页 */}
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

      {/* 模板预览模态框 */}
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
