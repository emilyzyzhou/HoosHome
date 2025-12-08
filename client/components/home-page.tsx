"use client";

import { useEffect, useState } from "react";
import Dashboard from "@/components/ui/dashboard";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { DashboardData } from "@/types/dashboard";

export default function HomePage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const API_BASE = 'https://hooshome-api-518521047014.us-east4.run.app';

    fetch(`${API_BASE}/home/roommates`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) {
          setError(true);
          return null;
        }
        return res.json();
      })
      .then((json) => {
        if (json) setData(json);
      })
      .catch(() => {
        setError(true);
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Banner with background image */}
      <div 
        className="relative bg-cover bg-center py-16"
        style={{ 
          backgroundImage: 'url(/lawnbg.jpg)',
        }}
      >
        {/* Dark overlay for text visibility */}
        <div className="absolute inset-0 bg-black/50"></div>
        
        {/* Banner content */}
        <div className="relative container mx-auto px-4">
          {error && (
            <div className="p-6 text-red-100 bg-red-900/80 rounded-lg backdrop-blur-sm border border-red-700">
              Failed to load dashboard data.
            </div>
          )}

          {!data && !error && (
            <div className="p-6 text-white">
              Loading dashboard…
            </div>
          )}

          {data && (
            <div className="flex justify-between items-start">
              <h1 className="text-5xl font-bold text-white drop-shadow-lg">
                My Home
              </h1>
              
              <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-2 border-orange-400 dark:border-amber-400 rounded-lg px-4 py-2 shadow-xl">
                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Join Code</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-amber-400 font-mono tracking-wider">
                  {data.join_code}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main content area */}
      <main className="flex-1 container mx-auto px-4 py-8 bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900">
        {data && <Dashboard data={data} />}
      </main>

      <Footer />
    </div>
  );
}
