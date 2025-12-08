"use client"

import { useSearchParams } from 'next/navigation';
import { LeasePageComponent } from "@/components/lease-page";
import { AlertCircle } from 'lucide-react';
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function LeasePage() {
    const searchParams = useSearchParams();
    const homeIdParam = searchParams.get('homeId');

    const homeId = homeIdParam ? parseInt(homeIdParam, 10) : null;
    
    if (homeId === null) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center p-4 bg-orange-50 dark:bg-slate-900">
                    <div className="p-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg flex items-center gap-2 border border-red-200">
                        <AlertCircle className="w-5 h-5"/> 
                        Error: Home ID not found. Please access this page from your Home dashboard.
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return <LeasePageComponent homeId={homeId} />;
}