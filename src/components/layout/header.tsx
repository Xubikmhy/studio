
"use client";
import type { HTMLAttributes } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserNav } from "@/components/layout/user-nav";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import { Printer } from "lucide-react"; 
import { AppActionsDropdown } from "./app-actions-dropdown";

interface HeaderProps extends HTMLAttributes<HTMLDivElement> {}

export function Header({ className, ...props }: HeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex h-16 items-center gap-x-2 sm:gap-x-4 border-b bg-background px-3 sm:px-4 md:px-6 shadow-sm",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2 md:hidden">
        <SidebarTrigger />
      </div>
      <div className="hidden md:flex items-center gap-2">
         <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-lg text-primary">
            <Printer className="h-6 w-6" />
            <span>{APP_NAME}</span>
          </Link>
      </div>
      {/* This div pushes UserNav and AppActionsDropdown to the right */}
      <div className="flex-grow md:hidden"></div>
      
      <div className="ml-auto flex items-center space-x-1 sm:space-x-2 md:space-x-4">
        {/* Placeholder for search or other actions */}
        {/* <Search /> */}
        <AppActionsDropdown />
        <UserNav />
      </div>
    </header>
  );
}
