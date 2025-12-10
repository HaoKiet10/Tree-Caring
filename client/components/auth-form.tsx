"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ĐỊA CHỈ SERVER BACKEND
const API_URL = "http://localhost:4000";

interface AuthFormProps {
  onAuth: (user: any) => void; // Sửa lại type để nhận object User đầy đủ
}

export default function AuthForm({ onAuth }: AuthFormProps) {
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState(""); // Thêm tên hiển thị
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validate cơ bản
    if (!email || !password) {
      setError("Vui lòng điền đầy đủ thông tin");
      setLoading(false);
      return;
    }

    if (!isSignIn && password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      setLoading(false);
      return;
    }

    // XÁC ĐỊNH ENDPOINT API
    const endpoint = isSignIn ? "/api/auth/login" : "/api/auth/register";

    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          fullName: !isSignIn ? fullName : undefined, // Chỉ gửi tên khi đăng ký
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Có lỗi xảy ra");
      }

      // Đăng nhập/Đăng ký thành công -> Trả user về Dashboard
      onAuth(data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-100 via-teal-100 to-cyan-100 px-4'>
      <Card className='w-full max-w-md shadow-xl'>
        <CardHeader className='space-y-3 text-center'>
          <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100'>
            <svg
              className='h-8 w-8 text-emerald-600'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 6v6m0 0v6m0-6h6m-6 0H6'
              />
            </svg>
          </div>
          <CardTitle className='text-2xl font-bold text-emerald-800'>
            {isSignIn ? "Chào mừng trở lại" : "Tạo tài khoản mới"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            {/* Thêm trường Tên khi đăng ký */}
            {!isSignIn && (
              <div className='space-y-2'>
                <Label htmlFor='fullName'>Họ và tên</Label>
                <Input
                  id='fullName'
                  type='text'
                  placeholder='Nguyễn Văn A'
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                type='email'
                placeholder='name@example.com'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='password'>Mật khẩu</Label>
              <Input
                id='password'
                type='password'
                placeholder='••••••••'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {!isSignIn && (
              <div className='space-y-2'>
                <Label htmlFor='confirmPassword'>Xác nhận mật khẩu</Label>
                <Input
                  id='confirmPassword'
                  type='password'
                  placeholder='••••••••'
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            )}
            {error && <p className='text-sm text-red-600'>{error}</p>}
            <Button
              type='submit'
              className='w-full bg-emerald-600 hover:bg-emerald-700'
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : isSignIn ? "Đăng nhập" : "Đăng ký"}
            </Button>
          </form>
          <div className='mt-4 text-center text-sm'>
            <button
              type='button'
              onClick={() => {
                setIsSignIn(!isSignIn);
                setError("");
              }}
              className='text-emerald-600 hover:underline'
            >
              {isSignIn
                ? "Chưa có tài khoản? Đăng ký"
                : "Đã có tài khoản? Đăng nhập"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
