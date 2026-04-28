"use client";

import { useState, Suspense, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const validateEmail = useCallback((value: string) => {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  }, []);

  const validatePassword = useCallback((value: string) => {
    if (!value) {
      setPasswordError("Password is required");
    } else {
      setPasswordError("");
    }
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const currentEmail = email;
    const currentPassword = password;

    try {
      // Use NextAuth signIn for proper session management
      const result = await signIn("credentials", {
        email: currentEmail,
        password: currentPassword,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password. Please try again.");
        return;
      }

      // Use callbackUrl if provided, otherwise determine by role
      if (callbackUrl) {
        router.push(callbackUrl);
        router.refresh();
      } else {
        // Fetch user info to determine redirect
        const userResponse = await fetch("/api/auth/me");
        if (userResponse.ok) {
          const userData = await userResponse.json();
          const adminRoles = ["ADMIN", "CONTENT_MANAGER", "SALES_AGENT", "SUPPORT_AGENT"];
          const vendorRoles = ["VENDOR"];
          let redirectUrl = "/planner";
          if (adminRoles.includes(userData.role)) redirectUrl = "/admin";
          else if (vendorRoles.includes(userData.role)) redirectUrl = "/vendor/dashboard";
          router.push(redirectUrl);
          router.refresh();
        } else {
          router.push("/planner");
          router.refresh();
        }
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Welcome Back</CardTitle>
        <CardDescription>
          Sign in to your account to continue
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                className={`pl-10 ${emailError ? "border-destructive" : ""}`}
                required
                disabled={isLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={(e) => validateEmail(e.target.value)}
              />
            </div>
            {emailError && <p className="text-xs text-destructive">{emailError}</p>}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-xs text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className={`pl-10 pr-10 ${passwordError ? "border-destructive" : ""}`}
                required
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={(e) => validatePassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {passwordError && <p className="text-xs text-destructive">{passwordError}</p>}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="remember" name="remember" />
            <Label htmlFor="remember" className="text-sm font-normal">
              Remember me for 30 days
            </Label>
          </div>

          <Button
            type="submit"
            className={`w-full transition-opacity ${isLoading ? "opacity-60 cursor-not-allowed" : ""}`}
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    }>
      <LoginForm />
    </Suspense>
  );
}
