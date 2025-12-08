"use client";

import { useEffect, useState } from "react";
import Dashboard from "@/components/ui/dashboard";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function HomePage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const API_BASE = 'https://hooshome-api-518521047014.us-east4.run.app';

    fetch(`${API_BASE}/home/dashboard`, {
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
            <h1 className="text-4xl font-bold mb-6 leading-normal
              bg-gradient-to-r from-blue-900 to-orange-600 
              dark:from-orange-300 dark:to-amber-300 
              bg-clip-text text-transparent"
            >
              My Home
            </h1>

            <Dashboard data={data} />
          </>
        )}
      </main>

      {}
      <Footer />
    </div>
  );
}
