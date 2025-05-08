"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Eye, EyeOff, Lock, User, ShieldCheck } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import Link from "next/link";

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
    <div className="flex items-stretch min-h-screen">
      {/* Left panel - Branding & information */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 flex-col justify-center items-center px-12 py-8">
        <div className="max-w-md text-center text-white">
          <div className="mb-8 flex justify-center">
            <div className="h-16 w-16 rounded-xl bg-white flex items-center justify-center">
              <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">SCPM</span>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold mb-6">Smart Car Parking Management</h1>
          <p className="text-lg opacity-90 mb-8">Hệ thống quản lý bãi đỗ xe thông minh giúp tối ưu hoá không gian và tăng hiệu quả vận hành.</p>
          
          <div className="grid grid-cols-1 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-left border border-white/20">
              <div className="flex items-center mb-2">
                <ShieldCheck className="mr-2 h-5 w-5 text-blue-200" />
                <h3 className="font-medium">Bảo mật cao</h3>
              </div>
              <p className="text-sm opacity-80">Dữ liệu của bạn luôn được bảo vệ với tiêu chuẩn bảo mật cao nhất.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <Card className="w-full max-w-md shadow-lg border-0">
          <CardHeader className="space-y-1 pb-6">
            <div className="lg:hidden flex justify-center mb-4">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl">
                SCPM
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center">Đăng nhập hệ thống</CardTitle>
            <CardDescription className="text-center text-gray-500">
              Nhập thông tin đăng nhập để truy cập trang quản trị
            </CardDescription>
          </CardHeader>
          
          <CardContent>
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
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-sm font-medium">Mật khẩu</Label>
                  <Link href="#" className="text-xs font-medium text-blue-600 hover:text-blue-800">
                    Quên mật khẩu?
                  </Link>
                </div>
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
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                    className="data-[state=checked]:bg-blue-600"
                  />
                  <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
                    Ghi nhớ đăng nhập
                  </label>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-500 text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-all duration-200 h-11"
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
          </CardContent>
          
          <CardFooter className="flex justify-center border-t pt-4 text-xs text-gray-500">
            © {new Date().getFullYear()} SCPM Dashboard - v1.0.0
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
