"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { NAV_ITEMS, type NavItem } from "@/lib/constants";
import { cn } from "@/lib/utils";

// Placeholder for admin status - replace with actual role check
const isAdmin = true; 

export function SidebarNav() {
  const pathname = usePathname();

  const filteredNavItems = NAV_ITEMS.filter(item => !item.adminOnly || isAdmin);

  return (
    <SidebarMenu>
      {filteredNavItems.map((item: NavItem) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href} passHref legacyBehavior>
            <SidebarMenuButton
              isActive={pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))}
              className={cn(
                "w-full justify-start",
                (pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href)))
                  ? "bg-primary/10 text-primary hover:bg-primary/20"
                  : "hover:bg-accent/50"
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
