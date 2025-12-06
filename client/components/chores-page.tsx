"use client"

import { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListChecks, Trash2, PlusCircle, Loader2 } from "lucide-react";

const DEMO_HOME_ID = 2; 
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE || ''; 

interface Chore {
    chore_id: number;
    title: string;
    due_date: string;
    home_id: number;
}

export function ChorePage() {
    const [chores, setChores] = useState<Chore[]>([]);
    const [newChoreTitle, setnewChoreTitle] = useState('');
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const HOME_ID_TO_USE = useMemo(() => {
        return DEMO_HOME_ID; 
    }, []);

    // 1. Fetch Chores on Load
    useEffect(() => {
        const fetchChores = async () => {
            if (HOME_ID_TO_USE === 0) return; // Prevent fetching if homeId is missing
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`${API_BASE_URL}/chore/${HOME_ID_TO_USE}`);
                const data = await res.json();

                if (res.ok && data.success) {
                    setChores(data.chores);
                } else {
                    throw new Error(data.error || "Failed to fetch chores.");
                }
            } catch (err) {
                console.error(err);
                setError("Could not load chore list. Check API server connection.");
            } finally {
                setLoading(false);
            }
        };

        fetchChores();
    }, [HOME_ID_TO_USE]);

    // 2. Add Chore Handler
    const handleAddChore = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newChoreTitle.trim()) return;
        setAdding(true);
        setError(null);

        try {
            const res = await fetch(`${API_BASE_URL}/chore/${HOME_ID_TO_USE}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newChoreTitle.trim() }),
            });
            const data = await res.json();

            if (res.ok && data.success) {
                setChores(prev => [
                    ...prev, 
                    { 
                        ...data.chore, 
                        created_at: new Date().toISOString()
                    }
                ]);
                setnewChoreTitle('');
            } else {
                throw new Error(data.error || "Failed to add chore.");
            }
        } catch (err) {
            console.error(err);
            setError("Error adding chore.");
        } finally {
            setAdding(false);
        }
    };

    // 3. Delete Chore Handler
    const handleDeleteChore = async (choreId: number) => {
        setError(null);
        
        const originalChores = chores;
        setChores(prev => prev.filter(c => c.chore_id !== choreId));

        try {
            const res = await fetch(`${API_BASE_URL}/chore/${choreId}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                setChores(originalChores);
                const data = await res.json();
                throw new Error(data.message || "Failed to delete chore.");
            }
        } catch (err) {
            console.error(err);
            setError("Error deleting chore. Reverted change.");
            setChores(originalChores); // Revert on error
        }
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900 flex flex-col items-center p-8">
            <Card className="w-full max-w-2xl shadow-2xl border-orange-100 dark:border-blue-800 relative z-10">
                <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-b from-orange-50 to-transparent dark:from-blue-900/20 dark:to-transparent pb-6">
                    <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-900 to-orange-600 dark:from-orange-300 dark:to-amber-300 flex items-center gap-3">
                        <ListChecks className="w-8 h-8"/> Chore Board
                    </CardTitle>
                    <div className="text-sm font-medium text-muted-foreground bg-orange-200/50 dark:bg-blue-800/20 p-2 rounded-lg">
                        Home ID: {HOME_ID_TO_USE}
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Error Display */}
                    {error && (
                        <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm border border-red-300">
                            {error}
                        </div>
                    )}

                    {/* Add Chore Form */}
                    <form onSubmit={handleAddChore} className="flex gap-2">
                        <Input
                            placeholder="Add a new chore (e.g., Take out trash)"
                            value={newChoreTitle}
                            onChange={(e) => setnewChoreTitle(e.target.value)}
                            disabled={adding}
                            className="flex-grow bg-white dark:bg-blue-900/30 border-orange-200 dark:border-blue-800 focus:ring-orange-500 dark:focus:ring-orange-400"
                        />
                        <Button 
                            type="submit" 
                            disabled={adding || !newChoreTitle.trim()}
                            className="bg-blue-900 hover:bg-blue-800 text-white font-semibold shadow-md"
                        >
                            {adding ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <PlusCircle className="w-4 h-4 mr-2"/>}
                            Add
                        </Button>
                    </form>

                    {/* Chore List Display */}
                    <div className="space-y-3 pt-4">
                        {loading ? (
                            <div className="flex items-center justify-center p-8 text-muted-foreground">
                                <Loader2 className="w-6 h-6 mr-2 animate-spin" /> Loading Chores...
                            </div>
                        ) : chores.length === 0 ? (
                            <p className="text-center text-muted-foreground p-8">
                                No chores yet! Add the first task above.
                            </p>
                        ) : (
                            <ul className="space-y-2">
                                {chores.map((chore) => (
                                    <li key={chore.chore_id} className="flex items-center justify-between p-3 bg-white dark:bg-blue-900/10 border border-orange-100 dark:border-blue-800/50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                        <span className="font-medium text-blue-900 dark:text-orange-100">
                                            {chore.title}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteChore(chore.chore_id)}
                                            className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}