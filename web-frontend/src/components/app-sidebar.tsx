"use client";
import {
  BarChart2,
  Command,
  DollarSign,
  FileText,
  Frame,
  Globe,
  LifeBuoy,
  LineChart,
  Map,
  PieChart,
  Send,
  TrendingUp,
  AlertTriangle,
  Users,
  ShieldCheck,
  Megaphone,
  Search,
  Phone,
  Bot,
  BookOpen,
  Award,
  Bell,
  Cog,
  Brush,
  Home,
  Shield,
  Settings,
  HelpCircle,
  Chrome,
  Smartphone,
  Activity
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavMain } from "./nav-main";
import { NavSecondary } from "./nav-secondary";
import { NavUser } from "./nav-user";
import Link from "next/link";

export const navigationData = {
  user: {
    name: "ByteCrew",
    email: "bytecrew@pronexus.in",
    avatar: "https://github.com/shadcn.png",
  },
  navMain: [
    {
      label: "Detection",
      items: [
        { name: "Overview", url: "/app", icon: Command },
        { name: "Analyze Message", url: "/app/analyze", icon: AlertTriangle },
      ],
    },
    {
      label: "Community",
      items: [
        { name: "Community Reports", url: "/app/reports", icon: Users },
        { name: "Scam Map", url: "/app/map", icon: Map },
      ],
    },
    {
      label: "Insights",
      items: [
        { name: "Analytics", url: "/app/analytics", icon: BarChart2 },
      ],
    },
    {
      label: "Resources",
      items: [
        { name: "Scam Awareness Tips", url: "/app/tips", icon: ShieldCheck },
      ],
    },
    {
      label: "Coming Soon",
      items: [
        { name: "Chrome Extension", url: "#", icon: Chrome, disabled: true, tooltip: "Coming Soon" },
        { name: "Mobile App", url: "#", icon: Smartphone, disabled: true, tooltip: "Coming Soon" },
        { name: "Personal Risk Score", url: "#", icon: Activity, disabled: true, tooltip: "Coming Soon" },
        { name: "Learning Center", url: "#", icon: BookOpen, disabled: true, tooltip: "Coming Soon" },
        { name: "Scam Search Engine", url: "#", icon: Search, disabled: true, tooltip: "Coming Soon" },
        { name: "Phone Number Lookup", url: "#", icon: Phone, disabled: true, tooltip: "Coming Soon" },
        { name: "AI Scam Trainer", url: "#", icon: Bot, disabled: true, tooltip: "Coming Soon" },
        { name: "Report Spam Cleanup Tool", url: "#", icon: Brush, disabled: true, tooltip: "Coming Soon" },
        { name: "Latest Scam Alerts", url: "#", icon: Megaphone, disabled: true, tooltip: "Coming Soon" },
      ],
    },
    {
      label: "Settings",
      items: [
        { name: "Settings", url: "/app/settings", icon: Cog },
      ],
    },
  ],
  navSecondary: [
    { title: "Support", url: "/app/support", icon: LifeBuoy },
    { title: "Feedback", url: "/app/feedback", icon: Send },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "/app/projects/design",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "/app/projects/sales",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "/app/projects/travel",
      icon: Map,
    },
  ],
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  pathname?: string;
}

export function AppSidebar({ pathname = "", ...props }: AppSidebarProps) {
  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/app">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Scam Detection</span>
                  <span className="truncate text-xs">Platform</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navigationData.navMain} currentPath={pathname} />
        {/* <NavProjects projects={navigationData.projects} /> */}
        <NavSecondary
          items={navigationData.navSecondary}
          className="mt-auto"
          currentPath={pathname}
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={navigationData.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
