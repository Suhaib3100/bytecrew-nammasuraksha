"use client";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { navigationData } from "./app-sidebar";
import { useMemo } from "react";
import React from "react";

interface SiteHeaderProps {
  pathname?: string;
}

export function SiteHeader({ pathname = "" }: SiteHeaderProps) {
  
  const breadcrumbItems = useMemo(() => {
    
    const items = [{ name: "Overview", url: "/app" }];

    
    if (pathname === "/app") return items;

    
    if (pathname === "/") return [];

    
    const segments = pathname.split("/").filter(Boolean);

   
    const startIndex = segments[0] === "app" ? 1 : 0;

   
    let currentPath = "/app";

    
    for (let i = startIndex; i < segments.length; i++) {
      const segment = segments[i];
      currentPath += `/${segment}`;

     
      let foundItem: any = null;

 
      navigationData.navMain.forEach(section => {
        section.items.forEach(item => {
          if (item.url === currentPath) {
            foundItem = item;
          }
        });
      });

     
      if (!foundItem) {
        navigationData.navSecondary.forEach(item => {
          if (item.url === currentPath) {
            foundItem = { name: item.title, url: item.url };
          }
        });
      }

  
      if (foundItem) {
        items.push({ name: foundItem.name, url: foundItem.url });
      } else {
        
        items.push({
          name:
            segment.charAt(0).toUpperCase() +
            segment.slice(1).replace(/-/g, " "),
          url: currentPath,
        });
      }
    }

    return items;
  }, [pathname]);


  const pageTitle =
    breadcrumbItems.length > 0
      ? breadcrumbItems[breadcrumbItems.length - 1].name
      : "Dashboard";

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <div className="flex flex-col">

          <Breadcrumb className="hidden md:block">
            <BreadcrumbList>
              {breadcrumbItems.map((item, index) => {
                const isLastItem = index === breadcrumbItems.length - 1;

                return (
                  <React.Fragment key={item.url}>
                    <BreadcrumbItem>
                      {isLastItem ? (
                        <BreadcrumbPage>{item.name}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={item.url}>
                          {item.name}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>

                    {!isLastItem && <BreadcrumbSeparator />}
                  </React.Fragment>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>
    </header>
  );
}
