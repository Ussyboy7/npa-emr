"use client";

import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import npalogo from "@/public/npalogo.png";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2 bg-gradient-to-br from-npa-primary via-npa-primary to-npa-primary-dark animate-gradient-x">
      {/* === LEFT: Form Card === */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl">
          {/* Branding */}
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

          {/* Heading */}
          <h2 className="text-white text-2xl font-semibold mb-6">Forgot Password</h2>
          <p className="text-white/80 text-sm mb-6">
            Enter your registered email to receive a password reset link.
          </p>

          {/* Form */}
          <form className="space-y-5">
            <Input
              type="email"
              placeholder="Email address"
              required
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40"
            />
            <Button
              type="submit"
              className="w-full bg-white text-npa-primary hover:bg-white/90 font-semibold py-3 rounded-xl transition"
            >
              Send Reset Link
            </Button>
          </form>
        </div>
      </div>

      {/* === RIGHT: Branding Image & blobs === */}
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