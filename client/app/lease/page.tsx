"use client"

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LeasePageComponent } from "@/components/lease-page";
import { AlertCircle, Loader2 } from 'lucide-react';
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

function LeasePageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const homeIdParam = searchParams.get('homeId');
    const [homeId, setHomeId] = useState<number | null>(homeIdParam ? parseInt(homeIdParam, 10) : null);
    const [isLoading, setIsLoading] = useState(!homeIdParam);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // If homeId is already in URL, we're done
        if (homeIdParam) {
            setHomeId(parseInt(homeIdParam, 10));
            setIsLoading(false);
            return;
        }

        // Otherwise, fetch it from the backend
        const fetchHomeId = async () => {
            try {
                const res = await fetch(`https://hooshome-api-518521047014.us-east4.run.app/home/roommates`, {
                    credentials: 'include'
                });
                
                if (!res.ok) {
                    throw new Error('Failed to fetch home data');
                }
                
                const data = await res.json();
                
                if (data.home_id) {
                    setHomeId(data.home_id);
                    // Update URL with homeId
                    router.replace(`/lease?homeId=${data.home_id}`);
                } else {
                    setError('No home found. Please join a home first.');
                }
            } catch (err) {
                console.error('Error fetching home ID:', err);
                setError('Failed to load home data. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchHomeId();
    }, [homeIdParam, router]);
    
    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center p-4 bg-orange-50 dark:bg-slate-900">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <Loader2 className="w-5 h-5 animate-spin"/> Loading...
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (error || homeId === null) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center p-4 bg-orange-50 dark:bg-slate-900">
                    <div className="p-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg flex items-center gap-2 border border-red-200">
                        <AlertCircle className="w-5 h-5"/> 
                        {error || 'Error: Home ID not found. Please access this page from your Home dashboard.'}
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return <LeasePageComponent homeId={homeId} />;
}

export default function LeasePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin" />
                </div>
                <Footer />
            </div>
        }>
            <LeasePageContent />
        </Suspense>
    );
}