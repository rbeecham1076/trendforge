"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  LayoutDashboard,
  Search,
  Bookmark,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  CreditCard,
} from "lucide-react";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    accent: "indigo",
  },
  {
    label: "Trend Search",
    href: "/dashboard/search",
    icon: Search,
    accent: "fuchsia",
  },
  {
    label: "Saved Projects",
    href: "/dashboard/projects",
    icon: Bookmark,
    accent: "amber",
  },
  {
    label: "Pricing",
    href: "/pricing",
    icon: CreditCard,
    accent: "emerald",
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    accent: "teal",
  },
];

const accentColors: Record<string, { bg: string; text: string; border: string; ring: string }> = {
  indigo: {
    bg: "bg-indigo-500/10",
    text: "text-indigo-400",
    border: "border-indigo-500/20",
    ring: "ring-indigo-500/30",
  },
  fuchsia: {
    bg: "bg-fuchsia-500/10",
    text: "text-fuchsia-400",
    border: "border-fuchsia-500/20",
    ring: "ring-fuchsia-500/30",
  },
  amber: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/20",
    ring: "ring-amber-500/30",
  },
  emerald: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
    ring: "ring-emerald-500/30",
  },
  teal: {
    bg: "bg-teal-500/10",
    text: "text-teal-400",
    border: "border-teal-500/20",
    ring: "ring-teal-500/30",
  },
};

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const userName = user?.fullName || user?.firstName || "User";
  const userEmail = user?.primaryEmailAddress?.emailAddress || "";
  const userInitial = (userName || "U").charAt(0).toUpperCase();

  async function handleSignOut() {
    await signOut(() => router.push("/"));
  }

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-white/10">
        <Link
          href="/dashboard"
          className={`flex items-center gap-2 ${collapsed ? "justify-center" : ""}`}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-coral-500">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold text-white">
              Trend<span className="text-fuchsia-400">Forge</span>
            </span>
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="hidden lg:flex"
          onClick={() => setCollapsed(!collapsed)}
        >
          <ChevronLeft
            className={`h-4 w-4 transition-transform ${collapsed ? "rotate-180" : ""}`}
          />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          const colors = accentColors[item.accent];

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? `${colors.bg} ${colors.text} ${colors.border} border`
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              } ${collapsed ? "justify-center px-2" : ""}`}
            >
              <Icon
                className={`h-5 w-5 shrink-0 ${
                  isActive
                    ? colors.text
                    : "text-gray-500 group-hover:text-gray-300"
                }`}
              />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-white/10 p-3">
        <div
          className={`flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-white/5 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-coral-500 text-sm font-medium text-white">
            {userInitial}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {userName}
              </p>
              <p className="text-xs text-gray-500 truncate">{userEmail}</p>
            </div>
          )}
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="text-gray-500 hover:text-red-400"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </Button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full bg-black border-r border-white/10 transition-all duration-300 lg:static lg:z-0 ${
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        } ${collapsed ? "w-[72px]" : "w-64"}`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
