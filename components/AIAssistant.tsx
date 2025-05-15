import React, { useState, useRef, useEffect } from "react";
import { Button, Drawer, Input, message, Upload, Avatar, Tooltip, Space, Spin, Typography } from "antd";
import {
  MessageOutlined,
  SendOutlined,
  UploadOutlined,
  CloseOutlined,
  RobotOutlined,
  UserOutlined,
  LoadingOutlined,
  StopOutlined,
} from "@ant-design/icons";
import axios from "axios";
import type { UploadFile } from "antd/es/upload/interface";
import type { InputRef } from "antd";
import { useRouter } from "next/navigation";

const { Text } = Typography;

interface Message {
  id?: number;
  role: "user" | "assistant";
  content: string;
  files?: UploadFile[];
  timestamp?: number;
  isTemplateRecommendation?: boolean;
}

interface Template {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  category: string;
  keywords: string[];
}

const TEMPLATE_KEYWORDS = [
  "推荐模板", "模板推荐", "电商模板", "找模板", "模板库", "模板市场",
  "产品模板", "推荐产品", "推荐商城", "商城模板", "推荐店铺", "店铺模板",
  "企业模板", "推荐企业", "个人模板", "推荐个人", "博客模板", "推荐博客",
  "商品展示", "产品展示", "商品详情", "产品介绍", "商品列表", "产品列表",
  "作品集", "作品展示", "案例展示", "作品案例", "设计作品", "摄影作品",
  "活动页面", "活动展示", "会议模板", "展会模板", "活动模板", "报名模板"
];

const AIAssistant: React.FC = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "嗨！我是平台的智能助手，可以帮你快速构建应用、解决技术问题和提供最佳实践建议。开始创建你的项目吧！",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [typingMessage, setTypingMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const inputRef = useRef<InputRef>(null);
  const [templateRecommendations, setTemplateRecommendations] = useState<Record<number, Template[]>>({});
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    if (open && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [messages, typingMessage, open]);

  useEffect(() => {
    if (open) {
      // 其他初始化逻辑保留
    }
  }, [open]);

  const simulateTyping = (text: string) => {
    let index = 0;
    setTypingMessage("");

    const interval = setInterval(() => {
      if (index < text.length) {
        setTypingMessage((prev) => prev + text[index]);
        index++;
      } else {
        clearInterval(interval);
        setTypingMessage("");
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: text,
            timestamp: Date.now(),
          },
        ]);
      }
    }, 30);

    typingIntervalRef.current = interval;
  };

  const stopTyping = () => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      setTypingMessage("");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: typingMessage,
          timestamp: Date.now(),
        },
      ]);
    }
  };

  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, []);

  const handleSendMessage = async () => {
    if (!input.trim() && fileList.length === 0) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      files: fileList,
      timestamp: Date.now(),
    };

    setInput("");
    setFileList([]);
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const isTemplateQuery = TEMPLATE_KEYWORDS.some((kw) => 
        userMessage.content.toLowerCase().includes(kw.toLowerCase())
      ) || (
        (userMessage.content.includes("推荐") || userMessage.content.includes("找")) && (
          userMessage.content.includes("模板") || 
          userMessage.content.includes("产品") || 
          userMessage.content.includes("商品") || 
          userMessage.content.includes("商城") || 
          userMessage.content.includes("店铺") || 
          userMessage.content.includes("企业") || 
          userMessage.content.includes("个人") || 
          userMessage.content.includes("博客") ||
          userMessage.content.includes("展示") ||
          userMessage.content.includes("详情") ||
          userMessage.content.includes("介绍") ||
          userMessage.content.includes("列表")
        )
      );

      if (isTemplateQuery) {
        const templateResponse = await axios.post("/api/templates/match", {
          query: userMessage.content,
          includeKeywords: true
        });
        
        if (templateResponse.data.success && templateResponse.data.templates.length > 0) {
          const messageId = Date.now();
          
          setTemplateRecommendations(prev => ({
            ...prev,
            [messageId]: templateResponse.data.templates
          }));
          
          const responseMessage = templateResponse.data.message || 
            `我找到了 ${templateResponse.data.templates.length} 个相关模板：`;
          
          setMessages((prev) => [
            ...prev,
            {
              id: messageId,
              role: "assistant",
              content: responseMessage,
              timestamp: Date.now(),
              isTemplateRecommendation: true
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: "抱歉，暂无相关模板。",
              timestamp: Date.now(),
            },
          ]);
        }
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("message", userMessage.content);
      
      const filteredHistory = messages.filter(msg => !('isTemplateRecommendation' in msg));
      formData.append("history", JSON.stringify(filteredHistory));
      
      fileList.forEach((file) => {
        formData.append("files", file.originFileObj as File);
      });

      const response = await axios.post("/api/ai/chat", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      simulateTyping(response.data.message);
    } catch (error) {
      message.error("发送消息失败，请重试");
      console.error("AI chat error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
    setFileList(newFileList);
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleUseTemplate = async (templateId: string) => {
    try {
      const response = await axios.post("/api/layouts", { 
        templateId: Number(templateId) 
      }, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem("token")}` 
        }
      });
      
      const { projectId } = response.data;
      message.success("项目创建成功，即将跳转到编辑器...");
      
      localStorage.setItem("lastChatHistory", JSON.stringify(messages));
      
      setOpen(false);
      
      setTimeout(() => router.push(`/editor/${projectId}`), 1000);
    } catch (error) {
      console.error("创建项目失败:", error);
      message.error("创建项目失败，请重试");
    }
  };

  const handleReset = () => {
    setMessages([
      {
        role: "assistant",
        content: "嗨！我是平台的智能助手，可以帮你快速构建应用、解决技术问题和提供最佳实践建议。开始创建你的项目吧！",
        timestamp: Date.now(),
      }
    ]);
    setTemplateRecommendations({});
    setInput("");
    setFileList([]);
  };

  const handleDrawerClose = () => {
    if (Object.keys(templateRecommendations).length > 0) {
      // 清空所有模板推荐记录
      setTemplateRecommendations({});
    }
    setOpen(false);
  };

  return (
    <>
      <Tooltip title="AI 助手">
        <Button
          type="primary"
          shape="circle"
          icon={<MessageOutlined />}
          onClick={() => setOpen(true)}
          style={{
            position: "fixed",
            right: 20,
            bottom: 20,
            width: 56,
            height: 56,
            fontSize: "20px",
            boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
            zIndex: 1000,
          }}
        />
      </Tooltip>

      <Drawer
        title={
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <RobotOutlined style={{ fontSize: "20px" }} />
              <span>AI 助手</span>
            </div>
            <Button type="text" size="small" onClick={handleReset} title="清空聊天">
              清空聊天
            </Button>
          </div>
        }
        placement="right"
        onClose={handleDrawerClose}
        open={open}
        width={420}
        closable={true}
        styles={{
          body: {
            padding: 0,
            display: "flex",
            flexDirection: "column",
            height: "100%",
          },
          header: {
            borderBottom: "1px solid #f0f0f0",
            padding: "12px 16px",
          }
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "20px 16px",
              backgroundColor: "#f9f9f9",
            }}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  marginBottom: "20px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: msg.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: msg.role === "user" ? "row-reverse" : "row",
                    alignItems: "flex-end",
                    gap: "8px",
                    maxWidth: "100%",
                  }}
                >
                  <Avatar
                    icon={msg.role === "user" ? <UserOutlined /> : <RobotOutlined />}
                    style={{
                      backgroundColor: msg.role === "user" ? "#1890ff" : "#bfbfbf",
                      flexShrink: 0,
                    }}
                  />
                  <div
                    style={{
                      padding: "12px 16px",
                      borderRadius: "16px",
                      backgroundColor: msg.role === "user" ? "#e6f7ff" : "#fff",
                      maxWidth: "calc(100% - 50px)",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                      border: msg.role === "user" ? "1px solid #91d5ff" : "1px solid #f0f0f0",
                      wordBreak: "break-word",
                    }}
                  >
                    <div style={{ whiteSpace: "pre-wrap" }}>
                      {msg.content}

                      {msg.role === "assistant" && index === 0 && (
                        <div style={{ marginTop: "12px" }}>
                          <Space style={{ width: "100%", justifyContent: "center" }}>
                            <Button type="primary" href="/workspace" style={{ width: "120px" }}>
                              创建新项目
                            </Button>
                            <Button href="/marketplace" style={{ width: "120px" }}>
                              浏览模板
                            </Button>
                          </Space>
                        </div>
                      )}

                      {msg.role === "assistant" && 
                       msg.isTemplateRecommendation && 
                       msg.id && 
                       templateRecommendations[msg.id] && 
                       templateRecommendations[msg.id].length > 0 && (
                        <div style={{ marginTop: "16px" }}>
                          <div className="template-grid">
                            {templateRecommendations[msg.id].map((template) => (
                              <div 
                                key={template.id}
                                className="template-card"
                                onClick={() => handleUseTemplate(template.id)}
                              >
                                <div className="template-image-container">
                                  <img
                                    alt={template.name}
                                    src={template.thumbnail}
                                    className="template-image"
                                  />
                                  <div className="template-hover-overlay">
                                    <Button type="primary">使用此模板</Button>
                                  </div>
                                </div>
                                <div className="template-content">
                                  <div className="template-title">{template.name}</div>
                                  <div className="template-description">{template.description}</div>
                                  <div className="template-tags">
                                    <span className="template-category">
                                      {template.category}
                                    </span>
                                    {Array.isArray(template.keywords) && template.keywords.slice(0, 2).map((keyword) => (
                                      <span
                                        key={keyword}
                                        className="template-keyword"
                                      >
                                        {keyword}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <Button 
                            type="primary" 
                            block 
                            href="/marketplace" 
                            style={{marginTop: "16px"}}
                          >
                            查看更多模板
                          </Button>
                        </div>
                      )}

                      {msg.role === "assistant" && msg.content.includes("暂无") && (
                        <div style={{ marginTop: "16px" }}>
                          <div style={{marginBottom: "12px"}}>
                            您可以去模板市场看看，那里有更多模板供您选择。
                          </div>
                            <Button type="primary" href="/marketplace">
                            浏览模板市场
                            </Button>
                        </div>
                      )}
                    </div>

                    {msg.files && msg.files.length > 0 && (
                      <div style={{ marginTop: "8px", borderTop: "1px solid #eee", paddingTop: "8px" }}>
                        {msg.files.map((file, i) => (
                          <div
                            key={i}
                            style={{
                              fontSize: "12px",
                              color: "#666",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <UploadOutlined /> {file.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {msg.timestamp && (
                  <Text
                    type="secondary"
                    style={{
                      fontSize: "12px",
                      marginTop: "4px",
                      marginLeft: msg.role === "user" ? "0" : "40px",
                      marginRight: msg.role === "user" ? "40px" : "0",
                    }}
                  >
                    {formatTime(msg.timestamp)}
                  </Text>
                )}
              </div>
            ))}

            {typingMessage && (
              <div
                style={{
                  marginBottom: "20px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: "8px",
                  }}
                >
                  <Avatar icon={<RobotOutlined />} style={{ backgroundColor: "#bfbfbf" }} />
                  <div
                    style={{
                      padding: "12px 16px",
                      borderRadius: "16px",
                      backgroundColor: "#fff",
                      maxWidth: "calc(100% - 50px)",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                      border: "1px solid #f0f0f0",
                      wordBreak: "break-word",
                    }}
                  >
                    <div style={{ whiteSpace: "pre-wrap" }}>
                      {typingMessage}
                      <span className="typing-cursor">|</span>
                    </div>
                    <div style={{ marginTop: "8px", display: "flex", justifyContent: "flex-end" }}>
                      <Button
                        type="text"
                        icon={<StopOutlined />}
                        onClick={stopTyping}
                        size="small"
                      >
                        结束回答
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {loading && !typingMessage && (
              <div
                style={{
                  marginBottom: "20px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: "8px",
                  }}
                >
                  <Avatar icon={<RobotOutlined />} style={{ backgroundColor: "#bfbfbf" }} />
                  <div
                    style={{
                      padding: "12px 16px",
                      borderRadius: "16px",
                      backgroundColor: "#fff",
                      maxWidth: "calc(100% - 50px)",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                      border: "1px solid #f0f0f0",
                    }}
                  >
                    <Spin indicator={<LoadingOutlined style={{ fontSize: 16 }} spin />} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              padding: "16px",
              backgroundColor: "#fff",
              borderTop: "1px solid #f0f0f0",
            }}
          >
            {fileList.length > 0 && (
              <div
                style={{
                  padding: "8px 12px",
                  backgroundColor: "#f5f5f5",
                  borderRadius: "8px",
                  marginBottom: "8px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "4px",
                  }}
                >
                  <Text type="secondary">已选择 {fileList.length} 个文件</Text>
                  <Button type="text" size="small" onClick={() => setFileList([])} icon={<CloseOutlined />} />
                </div>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "4px",
                  }}
                >
                  {fileList.map((file, index) => (
                    <Tooltip title={file.name} key={index}>
                      <div
                        style={{
                          padding: "2px 8px",
                          backgroundColor: "#e6f7ff",
                          borderRadius: "4px",
                          fontSize: "12px",
                          border: "1px solid #91d5ff",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          maxWidth: "150px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <UploadOutlined /> {file.name}
                      </div>
                    </Tooltip>
                  ))}
                </div>
              </div>
            )}

            <div
              style={{
                display: "flex",
                gap: "8px",
                alignItems: "center",
              }}
            >
              <Button
                icon={<UploadOutlined />}
                onClick={() => {
                  const el = document.getElementById("file-upload");
                  if (el) el.click();
                }}
                style={{
                  borderRadius: "20px",
                  height: "38px",
                  width: "38px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: 0,
                }}
              />
              <Upload
                id="file-upload"
                fileList={[]}
                onChange={handleFileChange}
                beforeUpload={() => false}
                multiple
                showUploadList={false}
                style={{ display: "none" }}
              >
                <div style={{ display: "none" }}></div>
              </Upload>

              <Input
                ref={inputRef}
                value={input}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(e)}
                placeholder="输入您的问题..."
                disabled={loading}
                style={{
                  borderRadius: "20px",
                  padding: "8px 12px",
                  height: "38px",
                }}
                suffix={
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSendMessage}
                    loading={loading}
                    style={{
                      borderRadius: "50%",
                      width: "32px",
                      height: "32px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "none",
                    }}
                    disabled={(!input.trim() && fileList.length === 0) || loading}
                  />
                }
              />
            </div>
            <div style={{ textAlign: "center" }}>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                按 Enter 发送，Shift + Enter 换行
              </Text>
            </div>
          </div>
        </div>
      </Drawer>

      <style jsx global>{`
        .typing-cursor {
          display: inline-block;
          width: 2px;
          height: 1em;
          background-color: #000;
          margin-left: 2px;
          animation: blink 1s infinite;
        }
        @keyframes blink {
          50% {
            opacity: 0;
          }
        }
        
        .template-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          width: 100%;
        }
        
        .template-card {
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          transition: all 0.3s ease;
          cursor: pointer;
          background: white;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        .template-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 6px 12px rgba(0,0,0,0.12);
        }
        
        .template-image-container {
          position: relative;
          height: 140px;
          overflow: hidden;
        }
        
        .template-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        
        .template-card:hover .template-image {
          transform: scale(1.05);
        }
        
        .template-hover-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .template-card:hover .template-hover-overlay {
          opacity: 1;
        }
        
        .template-content {
          padding: 12px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        
        .template-title {
          font-weight: 600;
          margin-bottom: 4px;
          color: #262626;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .template-description {
          color: #595959;
          font-size: 12px;
          line-height: 1.4;
          margin-bottom: 8px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          flex: 1;
        }
        
        .template-tags {
          margin-top: auto;
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }
        
        .template-category {
          background-color: #e6f7ff;
          color: #1890ff;
          border: 1px solid #91d5ff;
          padding: 1px 6px;
          border-radius: 4px;
          font-size: 11px;
        }
        
        .template-keyword {
          background-color: #f5f5f5;
          color: #595959;
          padding: 1px 6px;
          border-radius: 4px;
          font-size: 11px;
        }
        
        [style*="whiteSpace: pre-wrap"] {
          line-height: 1.5;
        }
        
        [style*="whiteSpace: pre-wrap"] {
          white-space: pre-wrap !important;
        }
        
        [style*="whiteSpace: pre-wrap"] code {
          background-color: #f5f5f5;
          border-radius: 4px;
          padding: 2px 4px;
          font-family: monospace;
          font-size: 0.9em;
        }
        
        [style*="whiteSpace: pre-wrap"] pre {
          background-color: #f5f5f5;
          border-radius: 4px;
          padding: 10px;
          margin: 8px 0;
          overflow-x: auto;
          font-family: monospace;
          white-space: pre;
        }
        
        [style*="whiteSpace: pre-wrap"] ul,
        [style*="whiteSpace: pre-wrap"] ol {
          padding-left: 20px;
          margin: 8px 0;
        }
        
        [style*="whiteSpace: pre-wrap"] p {
          margin: 8px 0;
        }
        
        [style*="whiteSpace: pre-wrap"] h1,
        [style*="whiteSpace: pre-wrap"] h2,
        [style*="whiteSpace: pre-wrap"] h3 {
          margin: 16px 0 8px 0;
          font-weight: 600;
        }
        
        [style*="whiteSpace: pre-wrap"] h1 { font-size: 1.2em; }
        [style*="whiteSpace: pre-wrap"] h2 { font-size: 1.1em; }
        [style*="whiteSpace: pre-wrap"] h3 { font-size: 1.05em; }
        
        [style*="whiteSpace: pre-wrap"] blockquote {
          border-left: 4px solid #ddd;
          padding-left: 12px;
          margin: 8px 0;
          color: #666;
        }
      `}</style>
    </>
  );
};

export default AIAssistant;
