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
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

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
    <div className="min-h-screen flex flex-col 
      bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100
      dark:from-slate-950 dark:via-blue-950 dark:to-slate-900"
    >
      {}
      <Navbar />

      {}
      <main className="flex-1 container mx-auto px-4 py-8">
        {error && (
          <div className="p-6 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg">
            Failed to load dashboard data.
          </div>
        )}

        {!data && !error && (
          <div className="p-6 text-gray-500 dark:text-gray-300">
            Loading dashboard…
          </div>
        )}

        {data && (
          <>
            <div className="flex justify-between items-start mb-6">
              <h1 className="text-4xl font-bold leading-normal
                bg-gradient-to-r from-blue-900 to-orange-600 
                dark:from-orange-300 dark:to-amber-300 
                bg-clip-text text-transparent"
              >
                My Home
              </h1>
              
              <div className="bg-white dark:bg-slate-800 border-2 border-orange-400 dark:border-amber-400 rounded-lg px-4 py-2 shadow-md">
                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Join Code</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-amber-400 font-mono tracking-wider">
                  {data.join_code}
                </p>
              </div>
            </div>

            <Dashboard data={data} />
          </>
        )}
      </main>

      {}
      <Footer />
    </div>
  );
}
