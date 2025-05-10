
"use client";
import type { HTMLAttributes } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserNav } from "@/components/layout/user-nav";
import { cn } from "@/lib/utils";
// import Link from "next/link";
// import { APP_NAME } from "@/lib/constants";
// import { Printer } from "lucide-react"; 
import { AppActionsDropdown } from "./app-actions-dropdown";

interface HeaderProps extends HTMLAttributes<HTMLDivElement> {}

export function Header({ className, ...props }: HeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex h-16 items-center gap-x-2 sm:gap-x-4 border-b bg-background/80 backdrop-blur-md px-4 sm:px-6 md:px-8 shadow-sm",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2 md:hidden">
        <SidebarTrigger />
      </div>
      {/* Redundant App Name/Icon removed, as it's in the sidebar
      <div className="hidden md:flex items-center gap-2">
         <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-lg text-primary">
            <Printer className="h-6 w-6" />
            <span>{APP_NAME}</span>
          </Link>
      </div> 
      */}
      
      {/* This div pushes UserNav and AppActionsDropdown to the right */}
      <div className="flex-grow"></div> 
      
      <div className="flex items-center space-x-2 sm:space-x-3">
        <AppActionsDropdown />
        <UserNav />
      </div>
    </header>
  );
}
