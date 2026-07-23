"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useAuth, useClerk } from "@clerk/nextjs";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Moon, Sun, TrendingUp, Menu, X } from "lucide-react";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut(() => router.push("/"));
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/5 bg-black/80 backdrop-blur-xl shadow-lg shadow-black/10"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-shadow">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">
              Trend<span className="text-indigo-400">Forge</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/#features"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Pricing
            </Link>

            {mounted && isSignedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox:
                        "h-9 w-9 ring-2 ring-indigo-500/30 rounded-full",
                    },
                  }}
                />
              </>
            ) : mounted ? (
              <>
                <SignInButton mode="modal">
                  <button className="text-sm text-gray-400 hover:text-white transition-colors">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button size="sm" variant="premium">
                    Get Started
                  </Button>
                </SignUpButton>
              </>
            ) : null}

            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-lg p-2 text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 md:hidden">
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-lg p-2 text-gray-400 hover:text-white"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </button>
            )}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-lg p-2 text-gray-400 hover:text-white"
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/5 bg-black/95 backdrop-blur-xl">
          <div className="space-y-1 px-4 py-4">
            <Link
              href="/#features"
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5"
            >
              Features
            </Link>
            <Link
              href="/pricing"
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5"
            >
              Pricing
            </Link>

            {mounted && isSignedIn ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5"
                >
                  Dashboard
                </Link>
                <div className="px-3 py-2 flex items-center gap-3">
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox:
                          "h-9 w-9 ring-2 ring-indigo-500/30 rounded-full",
                      },
                    }}
                  />
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      handleSignOut();
                    }}
                    className="text-sm text-gray-400 hover:text-red-400 transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              </>
            ) : mounted ? (
              <>
                <SignInButton mode="modal">
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="block w-full text-left rounded-lg px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5"
                  >
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <div className="px-3 pt-2">
                    <Button
                      className="w-full"
                      variant="premium"
                      onClick={() => setMobileOpen(false)}
                    >
                      Get Started
                    </Button>
                  </div>
                </SignUpButton>
              </>
            ) : null}
          </div>
        </div>
      )}
    </nav>
  );
}
