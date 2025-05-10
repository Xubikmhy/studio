"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { NAV_ITEMS, type NavItem, CURRENT_USER_DATA } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function SidebarNav() {
  const pathname = usePathname();
  const isAdmin = CURRENT_USER_DATA.role === 'admin';

  const filteredNavItems = NAV_ITEMS.filter(item => !item.adminOnly || isAdmin);

  return (
    <SidebarMenu>
      {filteredNavItems.map((item: NavItem) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href} passHref legacyBehavior>
            <SidebarMenuButton
              isActive={pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))}
              className={cn(
                "w-full justify-start text-sidebar-foreground/80 hover:text-sidebar-foreground", // Default state
                (pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href)))
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" // Active state
                  : "hover:bg-sidebar-accent/80" // Hover state for non-active
              )}
              tooltip={{ children: item.label, side: "right", align: "center" }}
            >
              <item.icon className="h-5 w-5 mr-3" />
              <span className="truncate">{item.label}</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
