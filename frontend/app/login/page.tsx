"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import npalogo from "@/public/npalogo.png";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${baseURL}/api/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Invalid username or password");
      }

      const data = await res.json();
      // Store tokens in localStorage or sessionStorage based on rememberMe
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem("accessToken", data.access);
      storage.setItem("refreshToken", data.refresh);

      toast({
        title: "Success",
        description: "Logged in successfully!",
      });
      router.push("/medical-records/dashboard");
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred. Please try again.");
      setShowErrorDialog(true);
      console.error("Login error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2 bg-gradient-to-br from-npa-primary via-npa-primary to-npa-primary-dark animate-gradient-x">
      {/* === LEFT: Login Form Card === */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl">
          {/* === Branding === */}
          <div className="flex items-center mb-8">
            <Image
              src={npalogo}
              alt="NPA Logo"
              width={40}
              height={40}
              className="rounded-lg mr-3"
              priority
            />
            <h1 className="text-white text-3xl font-bold">NPA EMR</h1>
          </div>

          {/* === Heading === */}
          <h2 className="text-white text-2xl font-semibold mb-6">Sign In</h2>

          {/* === Login Form === */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <Label htmlFor="username" className="text-white/80 text-sm">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-white/80 text-sm">
                Password
              </Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
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
                  onCheckedChange={(checked) => setRememberMe(!!checked)}
                  className="border-white/40 data-[state=checked]:bg-white data-[state=checked]:text-npa-primary"
                />
                <Label htmlFor="remember" className="text-white/80 text-sm">
                  Remember me
                </Label>
              </div>

              <Link
                href="/login/forgot-password"
                className="text-white/80 text-sm underline hover:text-white"
              >
                Forgot Password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-white text-npa-primary hover:bg-white/90 font-semibold py-3 rounded-xl transition"
            >
              {isSubmitting ? "Logging in..." : "Log In"}
            </Button>
          </form>

          {/* === Error Dialog === */}
          <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Error</AlertDialogTitle>
                <AlertDialogDescription>{errorMessage}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction onClick={() => setShowErrorDialog(false)}>
                  OK
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* === RIGHT: Branding image & blobs === */}
      <div className="hidden lg:flex items-center justify-center relative p-8">
        <div className="relative w-full max-w-lg">
          <Image
            src={npalogo}
            alt="NPA Logo"
            className="w-full h-auto rounded-2xl shadow-xl"
            priority
          />
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-gradient-to-br from-npa-primary to-npa-primary-dark rounded-full opacity-60 blur-xl"></div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-br from-npa-primary to-npa-primary-dark rounded-full opacity-40 blur-xl"></div>
        </div>
      </div>
    </div>
  );
}