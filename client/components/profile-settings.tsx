"use client";

import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { User, AlertCircle, Mail, CreditCard, Phone, CheckCircle2 } from "lucide-react"; 

type TabKey = "profile" | "password";
const tabs: { key: TabKey; label: string }[] = [
  { key: "profile", label: "Profile" },
  { key: "password", label: "Password" },
];

export default function ProfileSettings() {
  const [activeTab, setActiveTab] = useState<TabKey>("profile");

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900 flex flex-col md:flex-row">        
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-32 h-32 bg-orange-200 dark:bg-blue-800/30 rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-amber-200 dark:bg-orange-800/20 rounded-full opacity-20 blur-3xl"></div>
      </div>

      <aside className="md:w-60 border-b md:border-b-0 md:border-r border-slate-200 bg-gradient-to-b from-white to-amber-50/40 relative z-10">
        <div className="px-6 py-5 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-amber-600 uppercase tracking-wide">
            Account Settings
          </h2>
        </div>
        <nav className="flex md:flex-col overflow-x-auto md:overflow-visible">
          {tabs.map((tab) => {
            const isActive = tab.key === activeTab;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={[
                  "flex-1 md:flex-none px-5 py-3 md:px-6 md:py-4 text-sm font-medium flex items-center gap-2 transition",
                  isActive
                    ? "text-amber-700 bg-amber-50 border-l-4 border-amber-500 md:rounded-none"
                    : "text-slate-600 hover:bg-slate-50 md:border-l-4 md:border-transparent",
                ].join(" ")}
                aria-current={isActive ? "page" : undefined}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    isActive ? "bg-amber-500" : "bg-slate-300"
                  }`}
                />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 px-6 md:px-10 py-6 md:py-10 bg-gradient-to-br from-white via-white to-amber-50 relative z-10">
        {activeTab === "profile" && <AccountDetails />}
        {activeTab === "password" && <PasswordTab />}
      </main>
    </div>
  );
}

function AccountDetails() {
  const [currentName, setCurrentName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [billingInfo, setBillingInfo] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        setIsLoading(true);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/profile-settings/get-info`,
          {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          }
        );

        const data = await res.json();
        
        if (res.ok) {
          setCurrentName(data.user_info.name);
          setName(data.user_info.name);
          setEmail(data.user_info.email);
          setBillingInfo(data.user_info.bill_info);
          setPhoneNumber(data.user_info.phone_number);
        } else {
          setError("Error loading profile. You aren't signed in, perhaps?");
        }
      } catch (err) {
        console.error("Request failed, for some reason :/", err);
      }
      setIsLoading(false);
    }

    loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    
    if (!name) {
      setError("Your name cannot be empty.");
      return;
    }

    if (!email) {
      setError("Your email cannot be empty.");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    if (name.length > 255) {
      setError("Your name is too long.");
      return;
    }

    if (email.length > 255) {
      setError("Your email is too long.");
      return;
    }

    if (phoneNumber.length > 20) {
      setError("Your phone number is too long.");
      return;
    }

    if (billingInfo.length > 255) {
      setError("Your billing info is too long.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/profile-settings/update-info`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phoneNumber, billingInfo }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error ?? "Something went wrong. Try again later.");
      } else {
        setCurrentName(name);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Try again later.");
    } 
    setIsLoading(false);
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-900 dark:text-orange-200 mb-2">
          Hello, {currentName}
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Manage your account information below
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}
        
        {success && (
          <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg border border-green-200 dark:border-green-800">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">Info successfully updated!</span>
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-semibold text-blue-900 dark:text-orange-200">
            Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="pl-10 bg-orange-50 dark:bg-blue-900/30 border-orange-200 dark:border-blue-800 focus:ring-orange-500 dark:focus:ring-orange-400 text-blue-900 dark:text-white"
              disabled={isLoading}
              maxLength={255}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-semibold text-blue-900 dark:text-orange-200">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 bg-orange-50 dark:bg-blue-900/30 border-orange-200 dark:border-blue-800 focus:ring-orange-500 dark:focus:ring-orange-400 text-blue-900 dark:text-white"
              disabled={isLoading}
              maxLength={255}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="phoneNumber" className="text-sm font-semibold text-blue-900 dark:text-orange-200">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="Enter your phone number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="pl-10 bg-orange-50 dark:bg-blue-900/30 border-orange-200 dark:border-blue-800 focus:ring-orange-500 dark:focus:ring-orange-400 text-blue-900 dark:text-white"
              disabled={isLoading}
              maxLength={20}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="billingInfo" className="text-sm font-semibold text-blue-900 dark:text-orange-200">
            Billing Information
          </label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              id="billingInfo"
              type="text"
              placeholder="e.g. Venmo: @hooshome"
              value={billingInfo}
              onChange={(e) => setBillingInfo(e.target.value)}
              className="pl-10 bg-orange-50 dark:bg-blue-900/30 border-orange-200 dark:border-blue-800 focus:ring-orange-500 dark:focus:ring-orange-400 text-blue-900 dark:text-white"
              disabled={isLoading}
              maxLength={255}
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full md:w-auto bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white font-semibold shadow-lg"
          disabled={isLoading}
        >
          {isLoading ? "Updating..." : "Update Information"}
        </Button>
      </form>
    </div>
  );
}

function PasswordTab() {
  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-900 dark:text-orange-200 mb-2">
          Change Password
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Update your password to keep your account secure
        </p>
      </div>

      lmfao i gotta do this in a bit
    </div>
  );
}