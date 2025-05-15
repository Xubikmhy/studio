
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
import { useRouter } from "next/navigation";
// import { Separator } from "@/components/ui/separator"; // No longer needed
import { useToast } from "@/hooks/use-toast";

// Firebase imports - kept for potential future email/password auth with Firebase
// import { GoogleAuthProvider, signInWithPopup, type User } from "firebase/auth"; // No longer needed for Google
// import { auth } from "@/lib/firebase/client"; // Kept for general Firebase auth
// import { processGoogleSignIn } from "@/lib/actions"; // No longer needed

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isCredentialsLoading, setIsCredentialsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setIsCredentialsLoading(true);

    if (!email || !password) {
      setError("Please enter both email and password.");
      setIsCredentialsLoading(false);
      return;
    }

    // console.log("Attempting login with:", { email, password });

    // Simulate API call for credentials login
    setTimeout(() => {
      if (email === "admin@example.com" && password === "password") {
        toast({ title: "Login Successful", description: "Welcome back, Admin!" });
        router.push("/dashboard");
      } else if (email === "employee@example.com" && password === "password") {
        toast({ title: "Login Successful", description: "Welcome back!" });
        router.push("/dashboard");
      } else {
        setError("Invalid email or password. (Hint: admin@example.com or employee@example.com with password 'password')");
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
            Access your {APP_NAME} employee portal.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 p-6 sm:p-8">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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

            <p className="text-sm text-muted-foreground text-center mt-4">
              Need access? Contact administrator.
              {/* Removed "Try Demo Access" as it might conflict with direct login focus */}
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
