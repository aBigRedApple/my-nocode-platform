"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import axios from "@/utils/axios";
import { toast } from "react-toastify";
import ChangePasswordModal from "@/components/profile/ChangePasswordModal";
import ConfirmModal from "@/components/profile/ConfirmModal";
import EditUserModal from "@/components/profile/EditUserModal";
import ProjectsTabs from "@/components/profile/ProjectsTabs";
import UserInfoCard from "@/components/profile/UserInfoCard";

interface UserInfo {
  name: string;
  email: string;
}

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

const Profile: React.FC = () => {
  const { user, logout, refreshUserState, loading: authLoading } = useAuth();
  const [userInfo, setUserInfo] = useState<UserInfo>({ name: "", email: "" });
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isChangePasswordModalVisible, setIsChangePasswordModalVisible] = useState(false);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
      return;
    }
    if (user) fetchUserData();
  }, [user, authLoading, router]);

  const fetchUserData = async () => {
    try {
      const response = await axios.get("/api/user/profile");
      const { user, layouts, templates } = response.data;

      setUserInfo({ name: user.name, email: user.email });
      setProjects(
        layouts.map((layout: any) => ({
          id: layout.id,
          name: layout.name,
          description: layout.description || "暂无描述",
          createdAt: new Date(layout.createdAt).toLocaleDateString("zh-CN"),
          updatedAt: new Date(layout.updatedAt).toLocaleDateString("zh-CN"),
        }))
      );
      setTemplates(templates);
      setLoading(false);
    } catch (error) {
      toast.error("获取用户数据失败，请重新登录");
      router.push("/auth/login");
    }
  };

  const handleLogout = () => {
    logout();
    setIsLogoutModalVisible(false);
    router.push("/auth/login");
  };

  if (authLoading) return <div>Loading...</div>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 pt-16 h-full">
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 px-4 md:px-8 py-6 h-full">
        <UserInfoCard
          loading={loading}
          userInfo={userInfo}
          onEdit={() => setIsEditModalVisible(true)}
          onChangePassword={() => setIsChangePasswordModalVisible(true)}
          onLogout={() => setIsLogoutModalVisible(true)}
        />
        <ProjectsTabs
          loading={loading}
          projects={projects}
          templates={templates}
          setProjects={setProjects}
          router={router}
        />
      </div>

      <EditUserModal
        visible={isEditModalVisible}
        userInfo={userInfo}
        setUserInfo={setUserInfo}
        onClose={() => setIsEditModalVisible(false)}
        refreshUserState={refreshUserState}
      />
      <ChangePasswordModal
        visible={isChangePasswordModalVisible}
        onClose={() => setIsChangePasswordModalVisible(false)}
        onConfirm={() => setIsConfirmModalVisible(true)}
        logout={logout}
        router={router}
      />
      <ConfirmModal
        visible={isConfirmModalVisible}
        title="确认修改密码"
        content="修改密码后将需要重新登录，确定要继续吗？"
        onCancel={() => setIsConfirmModalVisible(false)}
        onConfirm={async () => {
          const formData = await document.querySelector("form")?.getAttribute("data-values"); // 示例，需适配实际表单
          await axios.put("/api/user/password", { password: formData });
          logout();
          router.push("/auth/login");
        }}
      />
      <ConfirmModal
        visible={isLogoutModalVisible}
        title="确认退出登录"
        content="确定要退出登录吗？"
        onCancel={() => setIsLogoutModalVisible(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
};

export default Profile;