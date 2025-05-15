
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_NAME, INITIAL_EMPLOYEES } from "@/lib/constants"; // Added INITIAL_EMPLOYEES
import { Printer, LogInIcon } from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isCredentialsLoading, setIsCredentialsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setIsCredentialsLoading(true);

    if (!username || !password) {
      setError("Please enter both username and password.");
      setIsCredentialsLoading(false);
      return;
    }

    // Simulate API call for credentials login
    setTimeout(() => {
      // Admin Check
      if (username.toLowerCase() === "admin" && password === "admin@123") {
        toast({ title: "Admin Login Successful", description: "Welcome back, Admin!" });
        // In a real app, you would set some session/token here
        // And update CURRENT_USER_DATA or use a context/store for the logged-in user.
        // For this demo, we assume CURRENT_USER_DATA is set to admin for admin features to work.
        router.push("/dashboard");
      } else {
        // Employee Check
        let employeeLoggedIn = false;
        for (const employee of INITIAL_EMPLOYEES) {
          const firstName = employee.name.split(" ")[0].toLowerCase();
          const expectedPassword = `${firstName}@123`;

          if (username.toLowerCase() === firstName && password === expectedPassword) {
            toast({ title: "Login Successful", description: `Welcome back, ${employee.name}!` });
            // IMPORTANT: This simulation does NOT change CURRENT_USER_DATA dynamically.
            // The application will still behave based on the hardcoded CURRENT_USER_DATA in constants.ts.
            // A real app would set a session indicating this user is logged in.
            router.push("/dashboard");
            employeeLoggedIn = true;
            break;
          }
        }

        if (!employeeLoggedIn) {
          setError("Invalid username or password. (Admin: admin/admin@123 or Employee: firstName/firstName@123)");
        }
      }
      setIsCredentialsLoading(false);
    }, 1000);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/10 via-background to-primary/5 p-4">
      <Card className="w-full max-w-md shadow-2xl rounded-xl overflow-hidden">
        <CardHeader className="space-y-2 text-center bg-card p-8">
          <div className="flex justify-center items-center gap-3 mb-2">
            <Printer className="h-10 w-10 text-primary" />
            <CardTitle className="text-4xl font-bold tracking-tight text-foreground">{APP_NAME}</CardTitle>
          </div>
          <CardDescription className="text-muted-foreground text-base">
            Access your {APP_NAME} portal.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 p-6 sm:p-8">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="admin OR employee_firstname"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="text-base"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Button variant="link" asChild className="text-sm p-0 h-auto text-primary hover:text-primary/80">
                  <Link href="#"
                    onClick={(e) => { e.preventDefault(); toast({ title: "Feature not implemented", description: "Password recovery is not yet available." }) }}
                  >
                    Forgot password?
                  </Link>
                </Button>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="text-base"
              />
            </div>
            {error && (
              <p className="text-sm text-destructive text-center bg-destructive/10 p-2 rounded-md">{error}</p>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4 p-6 sm:p-8 pt-2 bg-muted/30">
            <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={isCredentialsLoading}>
              {isCredentialsLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  <LogInIcon className="mr-2 h-5 w-5" /> Sign In
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2 px-4">
              (Demo login: admin/admin@123 or for employees, use their first name as username and firstname@123 as password e.g., alice/alice@123)
            </p>
            <p className="text-sm text-muted-foreground text-center mt-4">
              Need access? Contact administrator.
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
