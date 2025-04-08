"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        username: username,
        password: password,
      });

      if (result?.error) {
        setError("Tên đăng nhập hoặc mật khẩu không đúng. Vui lòng thử lại.");
        setIsLoading(false);
      } else if (result?.ok) {
        router.push(callbackUrl);
      } else {
        setError("Đã xảy ra lỗi không mong muốn trong quá trình đăng nhập");
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Login submission error:", err);
      setError("Đã xảy ra lỗi không mong muốn");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="p-8 bg-white rounded-lg shadow-xl border border-gray-100 w-full max-w-md transition-all duration-300 hover:shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Chào Mừng Trở Lại</h1>
          <p className="text-gray-500 mt-2">Đăng nhập vào tài khoản của bạn</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium">Tên đăng nhập</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <User size={18} />
              </div>
              <Input
                id="username"
                type="text"
                placeholder="Nhập tên đăng nhập của bạn"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">Mật khẩu</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <Lock size={18} />
              </div>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu của bạn"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
              />
              <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
                Ghi nhớ đăng nhập
              </label>
            </div>
            <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-800">
              Quên mật khẩu?
            </a>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-500 text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-all duration-200"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang đăng nhập...
              </div>
            ) : (
              "Đăng Nhập"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
