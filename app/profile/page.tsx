"use client";
import React, { useState, useEffect } from "react";
import { Modal, Input, Button, Tabs, Skeleton, Empty } from "antd";
import { useRouter } from "next/navigation";
import { UserOutlined, LockOutlined, ProjectOutlined, AppstoreOutlined, MailOutlined } from "@ant-design/icons";
import axios from "@/utils/axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Profile = () => {
  const [userInfo, setUserInfo] = useState({ name: "", email: "" });
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isChangePasswordModalVisible, setIsChangePasswordModalVisible] = useState(false);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentTab, setCurrentTab] = useState("projects");
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [templates, setTemplates] = useState([]);
  const router = useRouter();

  // 获取用户信息和项目数据
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/auth/login");
        return;
      }

      const response = await axios.get("/api/user/profile");

      const { user, layouts, templates } = response.data;

      setUserInfo({ name: user.name, email: user.email });
      setNewName(user.name);
      setNewEmail(user.email);

      const formattedProjects = layouts.map((layout) => ({
        id: layout.id,
        name: `项目 ${layout.id}`,
        date: new Date(layout.createdAt).toLocaleDateString("zh-CN"),
      }));

      setProjects(formattedProjects);
      setTemplates(templates);
      setLoading(false);
    } catch (error) {
      toast.error("获取用户数据失败，请重新登录");
      setTimeout(() => {
        router.push("/auth/login");
      }, 1000);
    }
  };

  useEffect(() => {
    fetchUserData();
    // 添加 storage 事件监听器，检测 localStorage 变化
    const handleStorageChange = (event) => {
      if (event.key === "token" && !event.newValue) {
        // token 被移除，跳转到登录页
        toast.info("登录状态已失效，请重新登录");
        router.push("/auth/login");
      }
    };

    // 监听 storage 事件
    window.addEventListener("storage", handleStorageChange);

    // 检查 token 是否存在，每秒轮询一次
    const checkTokenInterval = setInterval(() => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.info("登录状态已失效，请重新登录");
        router.push("/auth/login");
      }
    }, 1000);
    // 清理事件监听器和定时器
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(checkTokenInterval);
    };
  }, []);

  // 验证个人信息表单
  const validateProfileForm = () => {
    if (!newName || !newEmail) {
      toast.error("姓名和邮箱均为必填项");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      toast.error("请输入有效的邮箱格式");
      return false;
    }
    return true;
  };

  // 验证密码表单
  const validatePasswordForm = () => {
    if (!newPassword || !confirmPassword) {
      toast.error("请输入新密码和确认密码");
      return false;
    }
    if (newPassword.length < 6) {
      toast.error("密码长度至少6个字符");
      return false;
    }
    if (newPassword !== confirmPassword) {
      toast.error("两次输入的密码不一致");
      return false;
    }
    return true;
  };

  const handlePreLogout = () => {
    setIsLogoutModalVisible(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLogoutModalVisible(false);
    toast.success("已退出登录，即将跳转到登录页面...");
    setTimeout(() => {
      router.push("/auth/login");
    }, 1000);
  };

  const handleEditInfo = async () => {
    if (!validateProfileForm()) return;

    try {
      await axios.put("/api/user/profile", { name: newName, email: newEmail });
      setUserInfo({ name: newName, email: newEmail });
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const updatedUser = { ...storedUser, name: newName, email: newEmail };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setIsEditModalVisible(false);
      toast.success("个人信息已更新");
    } catch (error) {
      toast.error(error || "更新个人信息失败，请重试");
    }
  };

  const handlePreCheckPassword = () => {
    if (!validatePasswordForm()) return;
    setIsConfirmModalVisible(true);
  };

  const handleChangePassword = async () => {
    try {
      await axios.put("/api/user/password", { password: newPassword });
      setIsChangePasswordModalVisible(false);
      setIsConfirmModalVisible(false);
      setNewPassword("");
      setConfirmPassword("");
      toast.success("密码已成功更新，即将跳转到登录页面...", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setTimeout(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/auth/login");
      }, 2000);
    } catch (error) {
      toast.error(error || "更新密码失败，请重试");
    }
  };

  const handleDeleteProject = async (id) => {
    try {
      await axios.delete(`/api/layouts/${id}`);
      setProjects(projects.filter((project) => project.id !== id));
      toast.success("项目已删除");
    } catch (error) {
      toast.error(error.response?.data?.message || "删除项目失败，请重试");
    }
  };

  const handleEditProject = (id) => {
    router.push(`/editor/${id}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 pt-16 h-full">
      <ToastContainer />
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 px-4 md:px-8 py-6 h-full">
        <div className="w-full md:w-1/4 p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
          {loading ? (
            <Skeleton active paragraph={{ rows: 4 }} />
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
                <UserOutlined />
                <span>个人信息</span>
              </h2>
              <div className="mb-6 space-y-3">
                <p className="text-gray-600 dark:text-gray-300">
                  <span className="font-medium text-gray-800 dark:text-gray-200">姓名：</span>
                  {userInfo.name}
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  <span className="font-medium text-gray-800 dark:text-gray-200">邮箱：</span>
                  {userInfo.email}
                </p>
              </div>
              <div className="space-y-4">
                <Button
                  type="primary"
                  onClick={() => setIsEditModalVisible(true)}
                  className="w-full h-10 font-semibold transition-all hover:scale-[1.02]"
                  icon={<UserOutlined />}
                >
                  编辑信息
                </Button>
                <Button
                  onClick={() => setIsChangePasswordModalVisible(true)}
                  className="w-full h-10 font-semibold text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                  icon={<LockOutlined />}
                >
                  修改密码
                </Button>
                <Button
                  danger
                  onClick={handlePreLogout}
                  className="w-full h-10 font-semibold transition-all hover:scale-[1.02]"
                >
                  退出登录
                </Button>
              </div>
            </>
          )}
        </div>

        <div className="flex-1 p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
          <Tabs
            activeKey={currentTab}
            onChange={setCurrentTab}
            items={[
              {
                key: "projects",
                label: (
                  <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <ProjectOutlined />
                    我的项目
                  </span>
                ),
                children: (
                  <div className="grid gap-4">
                    {loading ? (
                      <Skeleton active paragraph={{ rows: 6 }} />
                    ) : projects.length > 0 ? (
                      projects.map((project) => (
                        <div
                          key={project.id}
                          className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                        >
                          <h3 className="font-semibold text-gray-800 dark:text-gray-100">{project.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{project.date}</p>
                          <div className="flex gap-2 mt-4">
                            <Button type="primary" size="small" onClick={() => handleEditProject(project.id)}>
                              编辑
                            </Button>
                            <Button danger size="small" onClick={() => handleDeleteProject(project.id)}>
                              删除
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <Empty description="暂无项目" />
                    )}
                    <Button
                      type="dashed"
                      className="flex items-center justify-center h-16"
                      onClick={() => router.push("/editor/new")}
                    >
                      + 创建新项目
                    </Button>
                  </div>
                ),
              },
              {
                key: "templates",
                label: (
                  <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <AppstoreOutlined />
                    我的模板
                  </span>
                ),
                children: (
                  <div className="grid gap-4">
                    {loading ? (
                      <Skeleton active paragraph={{ rows: 6 }} />
                    ) : templates.length > 0 ? (
                      templates.map((template) => (
                        <div
                          key={template.id}
                          className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                        >
                          <h3 className="font-semibold text-gray-800 dark:text-gray-100">模板 {template.id}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            关联项目ID: {template.layoutId}
                          </p>
                          <div className="flex gap-2 mt-4">
                            <Button type="primary" size="small" onClick={() => router.push(`/template/${template.id}`)}>
                              查看
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <Empty description="暂无收藏模板" />
                    )}
                  </div>
                ),
              },
            ]}
          />
        </div>
      </div>

      <Modal
        title="编辑个人信息"
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        onOk={handleEditInfo}
        footer={[
          <Button key="back" onClick={() => setIsEditModalVisible(false)}>
            取消
          </Button>,
          <Button key="submit" type="primary" onClick={handleEditInfo}>
            保存更改
          </Button>,
        ]}
      >
        <div className="space-y-4 pt-4">
          <Input
            prefix={<UserOutlined className="text-gray-400" />}
            placeholder="请输入姓名"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <Input
            prefix={<MailOutlined className="text-gray-400" />}
            placeholder="请输入邮箱"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
        </div>
      </Modal>

      <Modal
        title="修改密码"
        open={isChangePasswordModalVisible}
        onCancel={() => setIsChangePasswordModalVisible(false)}
        onOk={handlePreCheckPassword}
        footer={[
          <Button key="back" onClick={() => setIsChangePasswordModalVisible(false)}>
            取消
          </Button>,
          <Button key="submit" type="primary" onClick={handlePreCheckPassword}>
            确认修改
          </Button>,
        ]}
      >
        <div className="pt-4">
          <Input.Password
            prefix={<LockOutlined className="text-gray-400" />}
            placeholder="请输入新密码"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="mb-4"
          />
          <Input.Password
            prefix={<LockOutlined className="text-gray-400" />}
            placeholder="请确认新密码"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mb-4"
          />
        </div>
      </Modal>

      <Modal
        title="确认修改密码"
        open={isConfirmModalVisible}
        onCancel={() => setIsConfirmModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIsConfirmModalVisible(false)}>
            取消
          </Button>,
          <Button key="submit" type="primary" danger onClick={handleChangePassword}>
            确认修改
          </Button>,
        ]}
      >
        <p className="py-4">修改密码后将需要重新登录，确定要继续吗？</p>
      </Modal>

      <Modal
        title="确认退出登录"
        open={isLogoutModalVisible}
        onCancel={() => setIsLogoutModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIsLogoutModalVisible(false)}>
            取消
          </Button>,
          <Button key="submit" type="primary" danger onClick={handleLogout}>
            确认退出
          </Button>,
        ]}
      >
        <p className="py-4">确定要退出登录吗？</p>
      </Modal>
    </div>
  );
};

export default Profile;
