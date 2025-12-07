"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, UserPlus, Zap, AlertCircle, Link, Lock} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer"; 

export default function JoinPage() {
  const [joinCode, setJoinCode] = useState("");
  const [homeName, setHomeName] = useState("");
  const [homeAddress, setHomeAddress] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const isFormLoading = isLoading || (joinCode.length > 0 && isLoading); 

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setIsLoading(true);
    setMessage(""); 
    setMessageType("");

    if (joinCode.length !== 6) {
        setMessageType("error");
        setMessage("The join code must be exactly 6 digits.");
        setIsLoading(false);
        return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/home/join`, {
        method: 'POST', 
        credentials: "include",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ joinCode: joinCode }), 
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessageType("success");
        setMessage("Successfully found home!"); // this should direct to home later
      } else {
        setMessageType("error");
        setMessage(data.message || "Invalid join code. Please try again.");
      }
    } catch (error) {
      console.error("Join Home failed:", error);
      setMessageType("error");
      setMessage("Could not connect to the server. Please try again later.");
    } finally {
      setIsLoading(false); 
    }
  };

  const handleCreateHome = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setIsLoading(true);
    setMessage("");
    setMessageType("");
    
    if (!homeName || !homeAddress) {
        setMessageType("error");
        setMessage("Please provide both a Home Name and Address.");
        setIsLoading(false);
        return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/home/create-home`, {
        method: 'POST',
        credentials: "include",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          homeName: homeName, 
          homeAddress: homeAddress 
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessageType("success");
        setMessage(`Success! Your new join code is: ${data.newHome.joinCode}`);
        setHomeName("");
        setHomeAddress("");
      } else {
        setMessageType("error");
        setMessage(data.message || "Failed to create home. Please try again.");
      }
    } catch (error) {
      console.error("Create Home failed:", error);
      setMessageType("error");
      setMessage("Could not connect to the server. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const MessageDisplay = ({ type, text }: { type: "success" | "error" | "", text: string }) => {
    if (!text) return null;

    const baseClasses = "flex items-center gap-2 p-3 rounded-lg text-sm";
    const statusClasses = type === "error" 
      ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400" 
      : "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400";

    const Icon = type === "error" ? AlertCircle : Zap;

    return (
      <div className={`${baseClasses} ${statusClasses}`}>
        <Icon className="w-4 h-4 flex-shrink-0" />
        <span>{text}</span>
      </div>
    );
  };


  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-32 h-32 bg-orange-200 dark:bg-blue-800/30 rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-amber-200 dark:bg-orange-800/20 rounded-full opacity-20 blur-3xl"></div>
      </div>

      <Card className="w-full max-w-lg shadow-2xl border-orange-100 dark:border-blue-800 relative z-10">
        <CardHeader className="space-y-2 text-center bg-gradient-to-b from-orange-50 to-transparent dark:from-blue-900/20 dark:to-transparent pb-6">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-3 rounded-lg shadow-lg">
              <Home className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-orange-600 dark:from-orange-300 dark:to-amber-300 bg-clip-text text-transparent">
            Welcome to HoosHome!
          </CardTitle>
          <CardDescription className="text-base">Join an existing home or set up a new one</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-6">
            <MessageDisplay type={messageType} text={message} />

            {/* --- JOIN EXISTING HOME FORM --- */}
            <form onSubmit={handleJoinSubmit} className="space-y-4 p-4 border rounded-lg bg-orange-50 dark:bg-blue-900/10 border-orange-100 dark:border-blue-800/50">
                <p className="text-lg font-semibold text-blue-900 dark:text-orange-200">
                    <Link className="inline w-5 h-5 mr-2 text-orange-500 dark:text-amber-400" />
                    Join an Existing Home
                </p>
                
                <div className="relative">
                    <Zap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                    type="text"
                    placeholder="Enter 6-Digit Join Code"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
                    disabled={isFormLoading}
                    maxLength={6}
                    className="pl-10 bg-white dark:bg-blue-900/30 border-orange-200 dark:border-blue-800 focus:ring-orange-500 dark:focus:ring-orange-400 font-mono tracking-wider text-center"
                    />
                </div>
                
                <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold shadow-md" 
                    disabled={isFormLoading || joinCode.length !== 6}
                >
                    {isFormLoading ? "Processing..." : "Join Home"}
                </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground">
                <span className="p-2 bg-card rounded-full border border-border">OR</span>
            </div>

            {/* --- create a new home form --- */}
            <form onSubmit={handleCreateHome} className="space-y-4 p-4 border rounded-lg bg-white dark:bg-blue-900/20 border-orange-100 dark:border-blue-800/50">
                <p className="text-lg font-semibold text-blue-900 dark:text-orange-200">
                    <UserPlus className="inline w-5 h-5 mr-2 text-blue-900 dark:text-blue-400" />
                    Create a New Home
                </p>

                <div className="relative">
                    <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                    type="text"
                    placeholder="Home Name (e.g., 'The Wahoo Den')"
                    value={homeName}
                    onChange={(e) => setHomeName(e.target.value)}
                    disabled={isFormLoading}
                    required
                    className="pl-10 bg-orange-50 dark:bg-blue-900/30 border-orange-200 dark:border-blue-800 focus:ring-orange-500 dark:focus:ring-orange-400"
                    />
                </div>

                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                    type="text"
                    placeholder="Home Address"
                    value={homeAddress}
                    onChange={(e) => setHomeAddress(e.target.value)}
                    disabled={isFormLoading}
                    required
                    className="pl-10 bg-orange-50 dark:bg-blue-900/30 border-orange-200 dark:border-blue-800 focus:ring-orange-500 dark:focus:ring-orange-400"
                    />
                </div>

                <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white font-semibold shadow-md" 
                    disabled={isFormLoading || !homeName || !homeAddress}
                >
                    {isFormLoading ? "Creating..." : "Create Home"}
                </Button>
            </form>
          </div>
        </CardContent>
      </Card>
      </div>
      <Footer />
    </div>
  );
}