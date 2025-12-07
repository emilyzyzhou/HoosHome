// app/chore/page.tsx
"use client"

import { useSearchParams } from 'next/navigation';
import { ChorePage } from "@/components/chores-page";
import { AlertCircle } from 'lucide-react';

export default function ChoreBoardPage() {
    const searchParams = useSearchParams();
    const homeIdParam = searchParams.get('homeId');

    const homeId = homeIdParam ? parseInt(homeIdParam, 10) : null;
    
    if (homeId === null) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="p-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5"/> Error: Home ID not found in URL. Please log in or join a home.
                </div>
            </div>
        );
    }

    return <ChorePage homeId={homeId} />;
}