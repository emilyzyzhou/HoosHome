"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, Lock, Mail, AlertCircle } from "lucide-react"

interface LoginFormProps {
  onLoginSuccess: () => void
}

export function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)


const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");

  if (!email || !password) {
    setError("Please fill in all fields");
    return;
  }
  if (!email.includes("@")) {
    setError("Please enter a valid email address");
    return;
  }

  try {
    setIsLoading(true);
    const res = await fetch('https://hooshome-api-wnf7hi5crq-uk.a.run.app/auth/login', {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    // Debug raw response text
    const text = await res.text();
    console.log("Raw response:", text);
    console.log("Status:", res.status, "URL:", res.url);

    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      console.error("Not JSON response from server!");
      setError("Server returned unexpected response. Check API URL or server logs.");
      return;
    }

    // handle rate limit or login errors
    if (res.status === 429) {
      setError(data?.error || "Too many login attempts. Try again later.");
      return;
    }

    if (!res.ok) {
      setError(data?.error ?? "Login failed");
    } else {
      onLoginSuccess();
    }
  } catch (err) {
    console.error(err);
    setError("Network error");
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-32 h-32 bg-orange-200 dark:bg-blue-800/30 rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-amber-200 dark:bg-orange-800/20 rounded-full opacity-20 blur-3xl"></div>
      </div>

      <Card className="w-full max-w-md shadow-2xl border-orange-100 dark:border-blue-800 relative z-10">
        <CardHeader className="space-y-2 text-center bg-gradient-to-b from-orange-50 to-transparent dark:from-blue-900/20 dark:to-transparent pb-6">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-3 rounded-lg shadow-lg">
              <Home className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-orange-600 dark:from-orange-300 dark:to-amber-300 bg-clip-text text-transparent">
            HoosHome?
          </CardTitle>
          <CardDescription className="text-base">Organize your shared living space</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold text-blue-900 dark:text-orange-200">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-orange-50 dark:bg-blue-900/30 border-orange-200 dark:border-blue-800 focus:ring-orange-500 dark:focus:ring-orange-400"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold text-blue-900 dark:text-orange-200">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-orange-50 dark:bg-blue-900/30 border-orange-200 dark:border-blue-800 focus:ring-orange-500 dark:focus:ring-orange-400"
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white font-semibold shadow-lg"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Sign In"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">Demo credentials: any email and password</p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
