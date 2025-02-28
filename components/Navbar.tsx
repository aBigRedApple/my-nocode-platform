'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
      setIsAuthenticated(true);
      setUsername(JSON.parse(user).name); // Assuming user object has a "name" field
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  return (
    <header className="bg-white py-4 fixed w-full z-10 top-0 left-0 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-blue-600">无代码平台</h1>
        <nav className="space-x-6 text-blue-600">
          <Link href="/">
            <span
              className={`${
                pathname === '/' ? 'text-indigo-600 font-semibold' : 'hover:text-indigo-600'
              } hover:font-semibold hover:shadow-md transition duration-200`}
            >
              首页
            </span>
          </Link>
          <Link href="/marketplace">
            <span
              className={`${
                pathname === '/marketplace' ? 'text-indigo-600 font-semibold' : 'hover:text-indigo-600'
              } hover:font-semibold hover:shadow-md transition duration-200`}
            >
              模板市场
            </span>
          </Link>
          <Link href="/workspace">
            <span
              className={`${
                pathname === '/workspace' ? 'text-indigo-600 font-semibold' : 'hover:text-indigo-600'
              } hover:font-semibold hover:shadow-md transition duration-200`}
            >
              工作区
            </span>
          </Link>

          {isAuthenticated ? (
            <span className="text-indigo-600 font-semibold hover:text-indigo-600">
              Hi, {username}
            </span>
          ) : (
            <>
              <Link href="/auth/login">
                <span
                  className={`${
                    pathname === '/auth/login' ? 'text-indigo-600 font-semibold' : 'hover:text-indigo-600'
                  } hover:font-semibold hover:shadow-md transition duration-200`}
                >
                  登录
                </span>
              </Link>
              <Link href="/auth/register">
                <span
                  className={`${
                    pathname === '/auth/register' ? 'text-indigo-600 font-semibold' : 'hover:text-indigo-600'
                  } hover:font-semibold hover:shadow-md transition duration-200`}
                >
                  注册
                </span>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
