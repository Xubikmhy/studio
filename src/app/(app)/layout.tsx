"use client";
import type { PropsWithChildren } from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Header } from "@/components/layout/header";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { APP_NAME } from "@/lib/constants";
import Link from "next/link";
import { Print, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppLayout({ children }: PropsWithChildren) {
  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar collapsible="icon" className="border-r">
        <SidebarHeader className="p-4 flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-lg text-primary group-data-[collapsible=icon]:hidden">
                <Print className="h-6 w-6" />
                <span>{APP_NAME}</span>
            </Link>
            <Link href="/dashboard" className="items-center gap-2 font-semibold text-lg text-primary hidden group-data-[collapsible=icon]:flex">
                <Print className="h-6 w-6" />
            </Link>
          <div className="group-data-[collapsible=icon]:hidden">
            <SidebarTrigger />
          </div>
        </SidebarHeader>
        <SidebarContent className="p-2 pr-0">
          <SidebarNav />
        </SidebarContent>
        <SidebarFooter className="p-2 mt-auto">
            {/* Example Footer Item */}
            <Button variant="ghost" className="w-full justify-start group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:p-0">
                <Settings className="h-5 w-5 mr-3 group-data-[collapsible=icon]:mr-0" />
                <span className="truncate group-data-[collapsible=icon]:hidden">Settings</span>
            </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
