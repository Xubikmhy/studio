
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
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

// Firebase imports
import { GoogleAuthProvider, signInWithPopup, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { processGoogleSignIn } from "@/lib/actions";

// Simple SVG for Google Icon
const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    <path d="M1 1h22v22H1z" fill="none"/>
  </svg>
);


export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError(""); 

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    
    console.log("Attempting login with:", { email, password });

    if (email === "admin@example.com" && password === "password") {
      toast({ title: "Login Successful", description: "Welcome back, Admin!"});
      router.push("/dashboard");
    } else if (email === "employee@example.com" && password === "password") {
      toast({ title: "Login Successful", description: "Welcome back!"});
      // TODO: Set CURRENT_USER_DATA dynamically based on logged-in user
      // For now, admin or employee login both go to dashboard, app uses static CURRENT_USER_DATA
      router.push("/dashboard");
    }
     else {
      setError("Invalid email or password. (Hint: admin@example.com or employee@example.com / password)");
    }
  };

  const handleGoogleSignInClick = async () => {
    setIsGoogleLoading(true);
    setError("");
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (user) {
        const serverResult = await processGoogleSignIn({
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
        });

        if (serverResult.success) {
          toast({
            title: "Sign-In Successful",
            description: serverResult.message,
          });
          if (serverResult.redirectTo) {
            router.push(serverResult.redirectTo);
          } else {
            router.push("/dashboard"); // Fallback
          }
        } else {
          setError(serverResult.message || "Google Sign-In failed on server.");
          toast({
            title: "Sign-In Failed",
            description: serverResult.message || "Could not process Google Sign-In.",
            variant: "destructive",
          });
        }
      } else {
        throw new Error("No user information received from Google.");
      }
    } catch (error: any) {
      console.error("Google Sign-In Error:", error);
      let errorMessage = "Google Sign-In failed. Please try again.";
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = "Sign-in popup closed. Please try again.";
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = "Sign-in cancelled. Please try again.";
      }
      setError(errorMessage);
      toast({
        title: "Google Sign-In Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGoogleLoading(false);
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
            Enter your credentials or sign in with Google
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
                  onClick={(e) => { e.preventDefault(); toast({ title: "Feature not implemented", description: "Password recovery is not yet available."})}}
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
            
            <div className="relative w-full">
              <Separator className="absolute left-0 top-1/2 -translate-y-1/2 w-full" />
              <span className="relative bg-card px-2 text-xs uppercase text-muted-foreground z-10 flex justify-center">
                <span className="bg-card px-2">Or continue with</span>
              </span>
            </div>

            <Button variant="outline" className="w-full" onClick={handleGoogleSignInClick} disabled={isGoogleLoading}>
              {isGoogleLoading ? (
                "Signing in..."
              ) : (
                <>
                  <GoogleIcon /> Sign in with Google
                </>
              )}
            </Button>

            <p className="text-sm text-muted-foreground text-center">
              Don&apos;t have an account?{" "}
              <Button variant="link" asChild className="p-0 h-auto">
                 {/* In a real app, this would link to a sign-up page */}
                <Link href="/dashboard"> 
                  Get Started (Simulated)
                </Link>
              </Button>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
