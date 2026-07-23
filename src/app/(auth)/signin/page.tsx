"use client";

import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { TrendingUp } from "lucide-react";

const darkAppearance = {
  elements: {
    rootBox: "mx-auto",
    card: "bg-white/[0.03] border border-white/10 backdrop-blur-sm shadow-none rounded-xl",
    headerTitle: "text-white text-xl font-bold",
    headerSubtitle: "text-gray-400",
    socialButtonsBlockButton:
      "border-white/10 text-white bg-white/5 hover:bg-white/10 hover:border-white/20",
    socialButtonsBlockButtonText: "text-white font-medium",
    socialButtonsProviderIcon: "brightness-0 invert",
    dividerLine: "bg-white/10",
    dividerText: "text-gray-500 bg-black",
    formFieldLabel: "text-gray-300",
    formFieldInput:
      "bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-indigo-500 focus:ring-indigo-500/20 rounded-lg",
    formFieldInputShowPasswordButton: "text-gray-400",
    formButtonPrimary:
      "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25 border-0 text-white font-medium",
    footerActionLink: "text-indigo-400 hover:text-indigo-300",
    footerActionText: "text-gray-400",
    identityPreviewText: "text-white",
    identityPreviewEditButton: "text-indigo-400",
    formFieldAction: "text-indigo-400",
    formFieldErrorText: "text-red-400",
    alert: "bg-red-500/10 border-red-500/20 text-red-400",
    alertText: "text-red-400",
    otpCodeFieldInput: "bg-white/5 border-white/10 text-white",
  },
};

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">
              Trend<span className="text-indigo-400">Forge</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="mt-2 text-gray-400">Sign in to your account</p>
        </div>

        {/* Clerk SignIn */}
        <SignIn
          appearance={darkAppearance}
          routing="path"
          path="/signin"
          signUpUrl="/signup"
        />
      </div>
    </div>
  );
}
