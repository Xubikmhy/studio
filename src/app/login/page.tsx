
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
import { APP_NAME } from "@/lib/constants";
import { Printer, LogInIcon } from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation"; // Import useRouter

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter(); // Initialize useRouter

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError(""); // Clear previous errors

    // Basic validation (in a real app, use Zod or similar)
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    // Simulate login
    console.log("Attempting login with:", { email, password });

    // Placeholder: In a real app, you'd call an auth API here.
    // For now, we'll just simulate a successful login and redirect to dashboard.
    // This is NOT secure and for demonstration purposes only.
    if (email === "admin@example.com" && password === "password") {
      console.log("Simulated login successful!");
      // Redirect to dashboard on successful "login"
      router.push("/dashboard");
    } else {
      setError("Invalid email or password. (Hint: admin@example.com / password)");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-card p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            <Printer className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-bold">{APP_NAME}</CardTitle>
          </div>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="#"
                  className="text-sm text-muted-foreground hover:text-primary underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full">
              <LogInIcon className="mr-2 h-4 w-4" /> Login
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Don&apos;t have an account?{" "}
              <Button variant="link" asChild className="p-0 h-auto">
                 {/* In a real app, this would link to a sign-up page */}
                <Link href="/dashboard">
                  Get Started
                </Link>
              </Button>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
