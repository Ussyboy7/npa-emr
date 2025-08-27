"use client";

import { useState, useEffect } from "react";
import { LogOut, Bell, Moon, Sun, User, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import npalogo from "@/public/npalogo.png";

export default function TopBar() {
  const [darkMode, setDarkMode] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  // Toggle dark mode
  const toggleDarkMode = () => {
    const nextIsDark = !darkMode;
    document.documentElement.classList.toggle("dark", nextIsDark);
    setDarkMode(nextIsDark);
    localStorage.setItem("theme", nextIsDark ? "dark" : "light");
  };

  // Load theme on mount
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = stored ? stored === "dark" : prefersDark;
    document.documentElement.classList.toggle("dark", isDark);
    setDarkMode(isDark);
  }, []);

  const handleSignOut = () => {
    router.push("/login");
  };

  const handleChangePassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: Implement actual password change logic here (e.g., API call)
    console.log("Password change submitted");
    setShowChangePassword(false);
  };

  return (
    <>
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 border-b border-border shadow-sm 
                   bg-npa-primary text-white dark:bg-gray-950 dark:text-gray-100"
      >
        {/* Left: Logo + Greeting */}
        <div className="flex items-center gap-3">
          <Image
            src="/npalogo.png"
            alt="NPA Logo"
            width={36}
            height={36}
            className="rounded-full bg-white dark:bg-npa-dark"
          />
          <div className="leading-tight">
            <h2 className="text-sm font-semibold">Hello, Guest</h2>
            <p className="text-[11px] opacity-80">Role: Demo</p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          <button className="hover:text-npa-ash dark:hover:text-npa-ash transition-colors">
            <Bell size={18} />
          </button>

          <button
            onClick={toggleDarkMode}
            className="hover:text-yellow-400 transition-colors"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown((prev) => !prev)}
              className="hover:text-npa-ash dark:hover:text-npa-ash transition-colors"
            >
              <User size={18} />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-950 text-gray-950 dark:text-gray-100 border border-border rounded-md shadow-lg py-2 z-50">
                <button
                  onClick={() => {
                    router.push("/profile");
                    setShowDropdown(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-npa-accent dark:hover:bg-gray-800"
                >
                  Profile
                </button>
                <button
                  onClick={() => {
                    setShowChangePassword(true);
                    setShowDropdown(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-npa-accent dark:hover:bg-gray-800"
                >
                  Change Password
                </button>
                <button
                  onClick={handleSignOut}
                  className="flex w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-npa-accent dark:hover:bg-gray-800"
                >
                  <LogOut size={16} className="mr-2" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Change Password Modal */}
      <Dialog open={showChangePassword} onOpenChange={setShowChangePassword}>
        <DialogContent className="w-full max-w-md rounded-xl p-6 shadow-2xl text-white
             bg-gradient-to-br from-npa-primary via-npa-primary to-npa-primary-dark
             animate-gradient-x border border-white/20">
          <div className="flex items-center mb-4">
            <Image
              src={npalogo}
              alt="NPA Logo"
              width={32}
              height={32}
              className="rounded-lg mr-3"
              priority
            />
            <h1 className="text-white text-2xl font-bold">NPA EMR</h1>
          </div>
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-semibold mb-4">Change Password</DialogTitle>
          </DialogHeader>
          <p className="text-white/80 text-xs mb-4">
            Please enter your current password and choose a new one.
          </p>
          <form className="space-y-4" onSubmit={handleChangePassword}>
            <div className="relative">
              <Input
                type={showCurrentPassword ? "text" : "password"}
                placeholder="Current password"
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/80 hover:text-white"
              >
                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="relative">
              <Input
                type={showNewPassword ? "text" : "password"}
                placeholder="New password"
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/80 hover:text-white"
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/80 hover:text-white"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <Button
              type="submit"
              className="w-full bg-white text-npa-primary hover:bg-white/90 font-semibold py-2 rounded-xl transition"
            >
              Update Password
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}