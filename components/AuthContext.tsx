"use client";
import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "@/utils/axios";

// 定义用户类型
interface User {
  name: string;
  email?: string;
}

// 定义上下文类型
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User, token: string) => Promise<void>;
  logout: (redirectToLogin?: boolean) => void;
  refreshUserState: () => void;
}

// 创建上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 提供上下文的组件
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 验证 token 是否有效
  const verifyToken = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get("/api/auth/verify-token", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        const storedUser = localStorage.getItem("user");
        if (storedUser) setUser(JSON.parse(storedUser));
      } else {
        logout();
      }
    } catch (error) {
      console.error("Token verification failed", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  // 初始化和刷新用户状态
  const refreshUserState = () => {
    if (localStorage.getItem("token") && localStorage.getItem("user")) {
      verifyToken();
    } else {
      setUser(null);
      setLoading(false);
    }
  };

  // 登录函数
  const login = async (userData: User, token: string) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);

    // 触发全局事件通知其他页面更新
    window.dispatchEvent(new Event("auth-change"));
  };

  // 登出函数
  const logout = () => {
    // 清除用户信息
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);

    // 触发全局事件通知其他页面更新
    window.dispatchEvent(new Event("auth-change"));
  };

  // 监听存储变化 & 定期检查 token
  useEffect(() => {
    refreshUserState();

    const handleAuthChange = () => refreshUserState();
    window.addEventListener("auth-change", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    const intervalId = setInterval(refreshUserState, 5 * 60 * 1000);

    return () => {
      window.removeEventListener("auth-change", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
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
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
