"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavItem {
  name: string;
  url: string;
  icon?: LucideIcon;
  disabled?: boolean;
  tooltip?: string;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

interface NavMainProps {
  items: NavSection[];
  currentPath?: string;
  className?: string;
}

export function NavMain({ items, currentPath = "", className }: NavMainProps) {
  const { isMobile } = useSidebar();

  const isActive = (url: string) => {
    // Exact match for the overview page
    if (url === "/app" && currentPath === "/app") {
      return true;
    }

    // For other pages, check if the current path matches exactly or is a subpath
    if (
      url !== "/app" &&
      (currentPath === url ||
        (currentPath.startsWith(url) && currentPath.charAt(url.length) === "/"))
    ) {
      return true;
    }

    return false;
  };

  return (
    <div className={className}>
      {items.map((section, index) => (
        <SidebarGroup
          key={index}
          className="group-data-[collapsible=icon]:hidden"
        >
          <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
          <SidebarMenu>
            {section.items.map(item => (
              <SidebarMenuItem key={item.name}>
                {item.disabled ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center text-sm gap-2 px-3 py-2 cursor-not-allowed opacity-50">
                        {item.icon && (
                          <div className="flex size-5 items-center justify-center">
                            <item.icon className="size-4" />
                          </div>
                        )}
                        <span>{item.name}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{item.tooltip || "Coming Soon"}</p>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link href={item.url} className="flex items-center gap-2">
                      {item.icon && (
                        <div className="flex items-center justify-center">
                          <item.icon className="w-4 h" />
                        </div>
                      )}
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </div>
  );
}
