"use client";

import React, { createContext, useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import axios from "@/utils/axios"; // 假设你有一个 axios 实例

// 定义用户类型
interface User {
  name: string;
  email?: string;
}

// 定义上下文类型
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  refreshUserState: () => void;
}

// 创建上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 提供上下文的组件
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 验证 token 是否有效
  const verifyToken = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const response = await axios.get("/api/auth/verify-token", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 200) {
          const userData = localStorage.getItem("user");
          if (userData) {
            setUser(JSON.parse(userData));
          }
        } else {
          logout(); // token 无效，登出
        }
      } catch (error) {
        console.error("Token verification failed", error);
        logout(); // 请求失败，认为 token 无效，登出
      }
    } else {
      setUser(null);
      setLoading(false);
    }
  };

  // 初始化和刷新用户状态
  const refreshUserState = () => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      verifyToken(); // 检查 token 是否有效
    } else {
      setUser(null);
      setLoading(false);
    }
  };

  // 登录函数
  const login = (userData: User) => {
    setUser(userData);
  };

  // 登出函数
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/auth/login"); // 跳转到登录页
  };

  // 初始加载
  useEffect(() => {
    refreshUserState();

    // 添加存储事件监听器
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "token" || event.key === "user") {
        refreshUserState();
      }
    };

    // 添加自定义事件监听器用于同一页面内通信
    const handleAuthChange = () => {
      refreshUserState();
    };

    // 监听 "auth-change" 自定义事件
    window.addEventListener("auth-change", handleAuthChange);
    window.addEventListener("storage", handleStorageChange);

    // 定期检查（作为备用方案）
    const intervalId = setInterval(refreshUserState, 1000);

    return () => {
      window.removeEventListener("auth-change", handleAuthChange);
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(intervalId);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUserState }}>
      {children}
    </AuthContext.Provider>
  );
};

// 使用上下文的钩子
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
