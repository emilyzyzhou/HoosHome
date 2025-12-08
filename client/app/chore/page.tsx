"use client"

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ChorePage } from "@/components/chores-page";
import { AlertCircle, Loader2 } from 'lucide-react';

function ChoreBoardPageContent() {
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
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/home/roommates`, {
                    credentials: 'include'
                });
                
                if (!res.ok) {
                    throw new Error('Failed to fetch home data');
                }
                
                const data = await res.json();
                
                if (data.home_id) {
                    setHomeId(data.home_id);
                    // Update URL with homeId
                    router.replace(`/chore?homeId=${data.home_id}`);
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
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="flex items-center gap-2 text-gray-600">
                    <Loader2 className="w-5 h-5 animate-spin"/> Loading...
                </div>
            </div>
        );
    }

    if (error || homeId === null) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="p-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5"/> {error || 'Error: Home ID not found. Please log in or join a home.'}
                </div>
            </div>
        );
    }

    return <ChorePage homeId={homeId} />;
}

export default function ChoreBoardPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin" />
            </div>
        }>
            <ChoreBoardPageContent />
        </Suspense>
    );
}