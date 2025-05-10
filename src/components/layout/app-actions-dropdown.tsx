
"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Settings, HelpCircle, LogOut } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export function AppActionsDropdown() {
  const { toast } = useToast();
  const router = useRouter();

  const handlePlaceholderAction = (actionName: string) => {
    toast({
      title: "Action Triggered",
      description: `${actionName} selected. (This is a placeholder action)`,
    });
  };

  const handleLogout = () => {
    // In a real app, you'd clear auth tokens/session here
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out (simulated).",
    });
    router.push("/login");
  };


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 text-foreground/70 hover:text-foreground">
          <MoreVertical className="h-5 w-5" />
          <span className="sr-only">More actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => handlePlaceholderAction("View Notifications")}>
          {/* Placeholder - Bell icon could be used if notifications page exists */}
          View Notifications
        </DropdownMenuItem>
         <DropdownMenuItem asChild>
          <Link href="/settings">
            <Settings className="mr-2 h-4 w-4" />
            <span>App Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => handlePlaceholderAction("Help & Support")}>
          <HelpCircle className="mr-2 h-4 w-4" />
          Help & Support
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleLogout} className="text-destructive focus:text-destructive focus:bg-destructive/10">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
