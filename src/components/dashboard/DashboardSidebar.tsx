"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  BarChart2,
  Zap,
  Link2,
  Settings,
  LogOut,
  HelpCircle,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
}

interface DashboardSidebarProps {
  user: User | null;
  onSignOut: () => void;
}

const NavItem = ({ href, icon, label, isActive = false }: NavItemProps) => {
  return (
    <Link href={href} className="w-full">
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start gap-3 px-3 py-6 text-sm font-medium text-muted-foreground hover:bg-slate-800 hover:text-cyber-blue transition-all duration-200",
          isActive &&
            "bg-slate-800 text-cyber-blue border-r-2 border-cyber-blue",
        )}
      >
        {icon}
        {label}
      </Button>
    </Link>
  );
};

export default function DashboardSidebar({
  user,
  onSignOut,
}: DashboardSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/dashboard",
      icon: <LayoutDashboard size={20} />,
      label: "Dashboard",
    },
    {
      href: "/surveys",
      icon: <FileText size={20} />,
      label: "Surveys",
    },
    {
      href: "/responses",
      icon: <MessageSquare size={20} />,
      label: "Responses",
    },
    {
      href: "/analytics",
      icon: <BarChart2 size={20} />,
      label: "Analytics",
    },
    {
      href: "/automations",
      icon: <Zap size={20} />,
      label: "Automations",
    },
    {
      href: "/integrations",
      icon: <Link2 size={20} />,
      label: "Integrations",
    },
  ];

  return (
    <div className="flex h-full w-[280px] flex-col bg-slate-900/90 backdrop-blur-sm text-white font-orbitron border-r border-slate-800">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-6">
        <div className="h-8 w-8 rounded-md bg-cyber-blue"></div>
        <h1 className="text-xl font-bold text-cyber-blue text-enhanced">
          FeedbackPro
        </h1>
      </div>

      {/* Navigation */}
      <div className="mt-6 flex flex-col space-y-1 px-3">
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            isActive={pathname === item.href}
          />
        ))}
      </div>

      <div className="mt-auto">
        <Separator className="my-4 bg-slate-700" />

        {/* Settings and Help */}
        <div className="px-3">
          <NavItem
            href="/settings"
            icon={<Settings size={20} />}
            label="Settings"
            isActive={pathname === "/settings"}
          />
          <NavItem
            href="/help"
            icon={<HelpCircle size={20} />}
            label="Help & Support"
            isActive={pathname === "/help"}
          />
        </div>

        {/* User Profile */}
        <div className="mt-4 flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage
                src={
                  user?.user_metadata?.avatar_url ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`
                }
                alt={user?.user_metadata?.full_name || user?.email || "User"}
              />
              <AvatarFallback className="bg-slate-700 text-white">
                {user?.user_metadata?.full_name?.[0] || user?.email?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">
                {user?.user_metadata?.full_name || user?.email}
              </p>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-400 hover:text-white"
            onClick={onSignOut}
          >
            <LogOut size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}
