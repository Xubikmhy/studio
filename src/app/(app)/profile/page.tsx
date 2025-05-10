
// @ts-nocheck
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CURRENT_USER_DATA } from "@/lib/constants"; 
import { Edit3, KeyRound, ShieldCheck, Briefcase } from "lucide-react"; // Added Briefcase
import { useToast } from "@/hooks/use-toast";

// Use current user data from constants
const user = CURRENT_USER_DATA;

export default function ProfilePage() {
  const { toast } = useToast();
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const handleChangeProfilePicture = () => {
    toast({
      title: "Change Profile Picture",
      description: "This functionality is not yet implemented. (Simulated action)",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">My Profile</h1>
        <p className="text-muted-foreground">View and manage your personal information.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1 shadow-lg hover:shadow-xl transition-shadow duration-200">
          <CardHeader className="items-center text-center">
            <Avatar className="h-24 w-24 mb-4 ring-2 ring-primary ring-offset-2 ring-offset-background">
              <AvatarImage src={user.avatar} alt={user.name} data-ai-hint="profile person" />
              <AvatarFallback className="text-3xl">{initials}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-2xl">{user.name}</CardTitle>
            <CardDescription className="flex items-center justify-center gap-1">
                <Briefcase className="h-4 w-4 text-muted-foreground" /> 
                {/* Displaying the internal role from EMPLOYEES_SAMPLE if exists, or app role */}
                {CURRENT_USER_DATA.roleInternal || user.role} - {user.team} 
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button variant="outline" className="w-full" onClick={handleChangeProfilePicture}>
              <Edit3 className="mr-2 h-4 w-4" /> Change Profile Picture
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 shadow-lg hover:shadow-xl transition-shadow duration-200">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal details here. (Fields are currently read-only)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" defaultValue={user.name} readOnly />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" defaultValue={user.email} readOnly />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Label htmlFor="role">Role</Label>
                    <Input id="role" defaultValue={CURRENT_USER_DATA.roleInternal || user.role} readOnly />
                </div>
                 <div className="space-y-1">
                    <Label htmlFor="team">Team</Label>
                    <Input id="team" defaultValue={user.team} readOnly />
                </div>
            </div>
             <div className="space-y-1">
                <Label htmlFor="baseSalary">Base Salary (NPR)</Label>
                <Input id="baseSalary" defaultValue={user.baseSalary.toLocaleString()} readOnly />
            </div>
            <div className="pt-2">
                 <Button disabled> 
                    <Edit3 className="mr-2 h-4 w-4" /> Edit Information
                </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
          <CardDescription>Manage your account security preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-foreground mb-2">Password</h3>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-md bg-background/50">
              <p className="text-sm text-muted-foreground mb-2 sm:mb-0">Last changed: 3 months ago (placeholder)</p>
              <Button variant="outline" disabled>
                <KeyRound className="mr-2 h-4 w-4" /> Change Password
              </Button>
            </div>
          </div>
          
          <Separator />

          <div>
            <h3 className="text-lg font-medium text-foreground mb-2">Two-Factor Authentication (2FA)</h3>
             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-md bg-background/50">
              <p className="text-sm text-muted-foreground mb-2 sm:mb-0">Status: Not enabled (placeholder)</p>
              <Button variant="outline" disabled>
                <ShieldCheck className="mr-2 h-4 w-4" /> Configure 2FA
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
