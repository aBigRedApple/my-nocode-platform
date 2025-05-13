import React, { useState, useRef, useEffect } from "react";
import { Button, Drawer, Input as AntdInput, message, Upload, Avatar, Tooltip, Space, Spin, Typography, Card } from "antd";
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

const { Text } = Typography;

interface Message {
  role: "user" | "assistant";
  content: string;
  files?: UploadFile[];
  timestamp?: number;
}

interface Template {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  category: string;
  tags: string[];
}

const TEMPLATE_KEYWORDS = [
  "推荐模板", "模板推荐", "电商模板", "找模板", "模板库", "模板市场"
];

const AIAssistant: React.FC = () => {
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
  const inputRef = useRef<AntdInput>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    // 聚焦输入框当抽屉打开时
    if (open && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [messages, typingMessage, open]);

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

  const handleSend = async () => {
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
      // 判断是否为模板推荐请求
      const isTemplateQuery = TEMPLATE_KEYWORDS.some((kw) => userMessage.content.includes(kw));
      if (isTemplateQuery) {
        const templateResponse = await axios.post("/api/templates/match", {
          query: userMessage.content,
        });
        if (templateResponse.data.success) {
          setTemplates(templateResponse.data.templates);
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: `我找到了 ${templateResponse.data.templates.length} 个相关模板：`,
              timestamp: Date.now(),
            },
          ]);
        } else {
          setTemplates([]);
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: templateResponse.data.message || "暂无相关模板。",
              timestamp: Date.now(),
            },
          ]);
        }
        setLoading(false);
        return;
      }

      // 原有逻辑：先尝试匹配模板
      const templateResponse = await axios.post("/api/templates/match", {
        query: input.trim(),
      });

      if (templateResponse.data.success) {
        setTemplates(templateResponse.data.templates);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `我找到了 ${templateResponse.data.templates.length} 个相关模板：`,
            timestamp: Date.now(),
          },
        ]);
        setLoading(false);
        return;
      }

      // 如果没有匹配到模板，则发送到 AI
      const formData = new FormData();
      formData.append("message", userMessage.content);
      formData.append("history", JSON.stringify(messages));
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
      handleSend();
    }
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
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <RobotOutlined style={{ fontSize: "20px" }} />
            <span>AI 助手</span>
          </div>
        }
        placement="right"
        onClose={() => setOpen(false)}
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

                      {msg.role === "assistant" && templates.length > 0 && (
                        <div style={{ marginTop: "12px" }}>
                          <Space direction="vertical" style={{ width: "100%" }}>
                            {templates.map((template) => (
                              <Card
                                key={template.id}
                                hoverable
                                style={{ width: "100%" }}
                                cover={
                                  <img
                                    alt={template.name}
                                    src={template.thumbnail}
                                    style={{ height: 160, objectFit: "cover" }}
                                  />
                                }
                                onClick={() => {
                                  window.location.href = `/workspace?template=${template.id}`;
                                }}
                              >
                                <Card.Meta
                                  title={template.name}
                                  description={
                                    <div>
                                      <div>{template.description}</div>
                                      <div style={{ marginTop: 8 }}>
                                        <Space>
                                          <span
                                            style={{
                                              backgroundColor: "#e6f7ff",
                                              padding: "2px 8px",
                                              borderRadius: "4px",
                                              fontSize: "12px",
                                              color: "#1890ff",
                                              border: "1px solid #91d5ff",
                                            }}
                                          >
                                            {template.category}
                                          </span>
                                          {template.tags.map((tag) => (
                                            <span
                                              key={tag}
                                              style={{
                                                backgroundColor: "#f0f0f0",
                                                padding: "2px 8px",
                                                borderRadius: "4px",
                                                fontSize: "12px",
                                              }}
                                            >
                                              {tag}
                                            </span>
                                          ))}
                                        </Space>
                                      </div>
                                    </div>
                                  }
                                />
                              </Card>
                            ))}
                          </Space>
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

              <AntdInput
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
                    onClick={handleSend}
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
      `}</style>
    </>
  );
};

export default AIAssistant;
