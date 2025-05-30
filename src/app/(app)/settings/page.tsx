// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Moon, Sun, Bell, Trash2, Palette, UserCog } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { toast } = useToast();
  const [currentTheme, setCurrentTheme] = useState<string>("system");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedTheme = localStorage.getItem("theme") || "system";
    setCurrentTheme(storedTheme);
    // Initial theme application is handled by RootLayout
  }, []);

  const handleThemeChange = (newTheme: string) => {
    setCurrentTheme(newTheme);
    localStorage.setItem("theme", newTheme);

    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (newTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else { // system
      document.documentElement.classList.remove('dark'); // remove explicit theme
      // Re-apply system preference if it's dark
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      }
    }

    toast({
        title: "Theme Changed",
        description: `Theme set to ${newTheme === 'system' ? 'System Preference' : newTheme.charAt(0).toUpperCase() + newTheme.slice(1)}.`,
    });
  };
  
  if (!isMounted) {
    // Render nothing or a placeholder until the theme is determined client-side
    // This helps prevent hydration mismatches for the Select component's default value
    return null; 
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your application preferences and account settings.</p>
      </div>

      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
        <CardHeader>
          <CardTitle className="flex items-center"><Palette className="mr-2 h-5 w-5 text-primary"/> Appearance</CardTitle>
          <CardDescription>Customize the look and feel of the application.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg bg-background/50 hover:shadow-sm transition-shadow">
            <div>
              <Label htmlFor="theme-select" className="text-base font-medium">Theme</Label>
              <p className="text-sm text-muted-foreground">Select your preferred color scheme.</p>
            </div>
            <Select value={currentTheme} onValueChange={handleThemeChange}>
              <SelectTrigger id="theme-select" className="w-[180px]">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <div className="flex items-center">
                    <Sun className="mr-2 h-4 w-4" /> Light
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center">
                    <Moon className="mr-2 h-4 w-4" /> Dark
                  </div>
                </SelectItem>
                <SelectItem value="system">
                  <div className="flex items-center">
                    <Palette className="mr-2 h-4 w-4" /> System
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
        <CardHeader>
          <CardTitle className="flex items-center"><Bell className="mr-2 h-5 w-5 text-primary"/> Notifications</CardTitle>
          <CardDescription>Manage how you receive notifications.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg bg-background/50 hover:shadow-sm transition-shadow">
            <div>
              <Label htmlFor="email-notifications" className="text-base font-medium">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive important updates via email.</p>
            </div>
            <Switch id="email-notifications" defaultChecked disabled />
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg bg-background/50 hover:shadow-sm transition-shadow">
            <div>
              <Label htmlFor="push-notifications" className="text-base font-medium">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">Get real-time alerts in the app.</p>
            </div>
            <Switch id="push-notifications" disabled />
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
        <CardHeader>
          <CardTitle className="flex items-center"><UserCog className="mr-2 h-5 w-5 text-primary"/> Account Management</CardTitle>
          <CardDescription>Manage your account settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="flex items-center justify-between p-4 border rounded-lg bg-background/50 hover:shadow-sm transition-shadow">
            <div>
              <p className="text-base font-medium">Export Your Data</p>
              <p className="text-sm text-muted-foreground">Download a copy of your account data.</p>
            </div>
            <Button variant="outline" disabled>Export Data</Button>
          </div>
          <Separator/>
          <div className="flex items-center justify-between p-4 border border-destructive/50 rounded-lg bg-destructive/5 hover:shadow-sm transition-shadow">
            <div>
              <p className="text-base font-medium text-destructive">Delete Account</p>
              <p className="text-sm text-destructive/80">Permanently delete your account and all associated data. This action cannot be undone.</p>
            </div>
            <Button variant="destructive" disabled>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
