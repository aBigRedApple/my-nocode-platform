import React, { useState, useRef, useEffect } from 'react';
import { Button, Drawer, Input, message, Upload, Avatar, Tooltip, Space, Spin, Typography } from 'antd';
import { 
  MessageOutlined, 
  SendOutlined, 
  UploadOutlined, 
  CloseOutlined, 
  RobotOutlined,
  UserOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import axios from 'axios';
import type { UploadFile } from 'antd/es/upload/interface';

const { Text } = Typography;

interface Message {
  role: 'user' | 'assistant';
  content: string;
  files?: UploadFile[];
  timestamp?: number;
}

const AIAssistant: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: '你好！我是你的 AI 助手，有什么我可以帮你的吗？',
    timestamp: Date.now()
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [typingMessage, setTypingMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const inputRef = useRef<Input>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    setTypingMessage('');
    
    const interval = setInterval(() => {
      if (index < text.length) {
        setTypingMessage(prev => prev + text[index]);
        index++;
      } else {
        clearInterval(interval);
        setTypingMessage('');
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: text,
          timestamp: Date.now()
        }]);
      }
    }, 30);
  };

  const handleSend = async () => {
    if (!input.trim() && fileList.length === 0) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      files: fileList,
      timestamp: Date.now()
    };

    setInput('');
    setFileList([]);
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('message', userMessage.content);
      formData.append('history', JSON.stringify(messages));
      
      fileList.forEach(file => {
        formData.append('files', file.originFileObj as File);
      });

      const response = await axios.post('/api/ai/chat', formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      simulateTyping(response.data.message);
    } catch (error) {
      message.error('发送消息失败，请重试');
      console.error('AI chat error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
    setFileList(newFileList);
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearConversation = () => {
    setMessages([{
      role: 'assistant',
      content: '你好！我是你的 AI 助手，有什么我可以帮你的吗？',
      timestamp: Date.now()
    }]);
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
            position: 'fixed',
            right: 20,
            bottom: 20,
            width: 56,
            height: 56,
            fontSize: '20px',
            boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
            zIndex: 1000
          }}
        />
      </Tooltip>
      
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RobotOutlined style={{ fontSize: '20px' }} />
            <span>AI 助手</span>
          </div>
        }
        placement="right"
        onClose={() => setOpen(false)}
        open={open}
        width={420}
        closable={true}
        bodyStyle={{ 
          padding: 0, 
          display: 'flex', 
          flexDirection: 'column', 
          height: '100%' 
        }}
        headerStyle={{ 
          borderBottom: '1px solid #f0f0f0',
          padding: '12px 16px'
        }}
      >
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          height: '100%',
        }}>
          <div style={{ 
            flex: 1, 
            overflowY: 'auto',
            padding: '20px 16px',
            backgroundColor: '#f9f9f9'
          }}>
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  marginBottom: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div style={{ 
                  display: 'flex',
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                  alignItems: 'flex-end',
                  gap: '8px',
                  maxWidth: '100%'
                }}>
                  <Avatar 
                    icon={msg.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
                    style={{ 
                      backgroundColor: msg.role === 'user' ? '#1890ff' : '#bfbfbf',
                      flexShrink: 0
                    }}
                  />
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: '16px',
                    backgroundColor: msg.role === 'user' ? '#e6f7ff' : '#fff',
                    maxWidth: 'calc(100% - 50px)',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                    border: msg.role === 'user' ? '1px solid #91d5ff' : '1px solid #f0f0f0',
                    wordBreak: 'break-word'
                  }}>
                    <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                    
                    {msg.files && msg.files.length > 0 && (
                      <div style={{ marginTop: '8px', borderTop: '1px solid #eee', paddingTop: '8px' }}>
                        {msg.files.map((file, i) => (
                          <div key={i} style={{ fontSize: '12px', color: '#666', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <UploadOutlined /> {file.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                {msg.timestamp && (
                  <Text type="secondary" style={{ 
                    fontSize: '12px', 
                    marginTop: '4px',
                    marginLeft: msg.role === 'user' ? '0' : '40px',
                    marginRight: msg.role === 'user' ? '40px' : '0',
                  }}>
                    {formatTime(msg.timestamp)}
                  </Text>
                )}
              </div>
            ))}
            
            {typingMessage && (
              <div style={{
                marginBottom: '20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
              }}>
                <div style={{ 
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: '8px'
                }}>
                  <Avatar 
                    icon={<RobotOutlined />}
                    style={{ backgroundColor: '#bfbfbf' }}
                  />
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: '16px',
                    backgroundColor: '#fff',
                    maxWidth: 'calc(100% - 50px)',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                    border: '1px solid #f0f0f0',
                    wordBreak: 'break-word'
                  }}>
                    <div style={{ whiteSpace: 'pre-wrap' }}>
                      {typingMessage}
                      <span className="typing-cursor">|</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {loading && !typingMessage && (
              <div style={{
                marginBottom: '20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
              }}>
                <div style={{ 
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: '8px'
                }}>
                  <Avatar 
                    icon={<RobotOutlined />}
                    style={{ backgroundColor: '#bfbfbf' }}
                  />
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: '16px',
                    backgroundColor: '#fff',
                    maxWidth: 'calc(100% - 50px)',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                    border: '1px solid #f0f0f0'
                  }}>
                    <Spin indicator={<LoadingOutlined style={{ fontSize: 16 }} spin />} />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '12px',
            padding: '16px',
            backgroundColor: '#fff',
            borderTop: '1px solid #f0f0f0'
          }}>
            {fileList.length > 0 && (
              <div style={{ 
                padding: '8px 12px',
                backgroundColor: '#f5f5f5',
                borderRadius: '8px',
                marginBottom: '8px'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '4px'
                }}>
                  <Text type="secondary">已选择 {fileList.length} 个文件</Text>
                  <Button 
                    type="text" 
                    size="small" 
                    onClick={() => setFileList([])}
                    icon={<CloseOutlined />}
                  />
                </div>
                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: '4px' 
                }}>
                  {fileList.map((file, index) => (
                    <Tooltip title={file.name} key={index}>
                      <div style={{ 
                        padding: '2px 8px',
                        backgroundColor: '#e6f7ff',
                        borderRadius: '4px',
                        fontSize: '12px',
                        border: '1px solid #91d5ff',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        maxWidth: '150px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        <UploadOutlined /> {file.name}
                      </div>
                    </Tooltip>
                  ))}
                </div>
              </div>
            )}
            
            <div style={{ 
              display: 'flex', 
              gap: '8px', 
              alignItems: 'center'
            }}>
              <Button 
                icon={<UploadOutlined />} 
                onClick={() => document.getElementById('file-upload').click()}
                style={{ 
                  borderRadius: '20px', 
                  height: '38px',
                  width: '38px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: 0
                }}
              />
              <Upload
                id="file-upload"
                fileList={[]}
                onChange={handleFileChange}
                beforeUpload={() => false}
                multiple
                showUploadList={false}
                style={{ display: 'none' }}
              >
                <div style={{ display: 'none' }}></div>
              </Upload>
              
              <Input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入您的问题..."
                disabled={loading}
                style={{ 
                  borderRadius: '20px',
                  padding: '8px 12px',
                  height: '38px'
                }}
                suffix={
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSend}
                    loading={loading}
                    style={{ 
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: 'none'
                    }}
                    disabled={(!input.trim() && fileList.length === 0) || loading}
                  />
                }
              />
            </div>
            <div style={{ textAlign: 'center' }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
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
          50% { opacity: 0; }
        }
      `}</style>
    </>
  );
};

export default AIAssistant;