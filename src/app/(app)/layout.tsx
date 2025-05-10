
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
import { Printer, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppLayout({ children }: PropsWithChildren) {
  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar collapsible="icon" className="border-r bg-sidebar text-sidebar-foreground">
        <SidebarHeader className="p-4 flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2.5 font-semibold text-xl text-sidebar-primary hover:text-sidebar-primary/90 transition-colors">
                <Printer className="h-6 w-6" />
                <span className="group-data-[collapsible=icon]:hidden">{APP_NAME}</span>
            </Link>
            <SidebarTrigger className="text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent" />
        </SidebarHeader>
        <SidebarContent className="p-2 pr-0">
          <SidebarNav />
        </SidebarContent>
        <SidebarFooter className="p-2 mt-auto border-t border-sidebar-border">
            <Button variant="ghost" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:p-0" asChild>
                <Link href="/settings">
                    <Settings className="h-5 w-5 mr-3 group-data-[collapsible=icon]:mr-0" />
                    <span className="truncate group-data-[collapsible=icon]:hidden">Settings</span>
                </Link>
            </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-background">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
