"use client"

import { useState, useEffect} from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListChecks, Trash2, PlusCircle, Loader2, Repeat, Calendar, AlignLeft } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE || ''; 

interface Chore {
    chore_id: number;
    title: string;
    due_date: string | null;
    home_id: number;
    description: string | null;
    recurrence: string | null;
}

interface ChorePageProps {
    homeId: number | null;
}

const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
    } catch {
        return dateString; 
    }
};

export function ChorePage({homeId}: ChorePageProps) {
    const [chores, setChores] = useState<Chore[]>([]);
    const [newChoreTitle, setnewChoreTitle] = useState('');
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const HOME_ID_TO_USE = homeId;

    useEffect(() => {
        const fetchChores = async () => {
            if (!HOME_ID_TO_USE) {
                setLoading(false);
                return;
            }
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

    // Add Chore Handler
    const handleAddChore = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newChoreTitle.trim() || !HOME_ID_TO_USE) return;
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
                        description: null,
                        due_date: '2025-10-28',
                        recurrence: 'Weekly'
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

    // Delete Chore Handler
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
    // update chore handler: TODO



    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900 flex flex-col items-center p-8">
            <Card className="w-full max-w-2xl shadow-2xl border-orange-100 dark:border-blue-800 relative z-10">
                <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-b from-orange-50 to-transparent dark:from-blue-900/20 dark:to-transparent pb-6">
                    <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-900 to-orange-600 dark:from-orange-300 dark:to-amber-300 flex items-center gap-3">
                        <ListChecks className="w-8 h-8"/> Chore Board
                    </CardTitle>
                    {HOME_ID_TO_USE && ( 
                    <div className="text-sm font-medium text-muted-foreground bg-orange-200/50 dark:bg-blue-800/20 p-2 rounded-lg">
                        Home ID: {HOME_ID_TO_USE}
                    </div>
                    )}
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
                        
                        {/* 2. Render List with Columns */}
                        {chores.length > 0 && (
                            // Add column headers
                            <div className="grid grid-cols-12 font-semibold text-xs text-muted-foreground uppercase py-2 border-b dark:border-blue-800/50">
                                <div className="col-span-4 pl-3">Chore</div>
                                <div className="col-span-3">Due Date</div>
                                <div className="col-span-3">Recurrence</div>
                                <div className="col-span-2 text-right pr-3">Actions</div>
                            </div>
                        )}

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
                                    <li key={chore.chore_id} className="grid grid-cols-12 items-center p-3 bg-white dark:bg-blue-900/10 border border-orange-100 dark:border-blue-800/50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                        
                                        {/* TITLE & DESCRIPTION */}
                                        <div className="col-span-4 flex flex-col pl-3">
                                            <span className="font-semibold text-blue-900 dark:text-orange-100">
                                                {chore.title}
                                            </span>
                                            {chore.description && (
                                                <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                                    <AlignLeft className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                                                    {chore.description}
                                                </span>
                                            )}
                                        </div>

                                        {/* DUE DATE */}
                                        <div className="col-span-3 text-sm flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-orange-500 dark:text-amber-400" />
                                            {formatDate(chore.due_date)}
                                        </div>

                                        {/* RECURRENCE */}
                                        <div className="col-span-3 text-sm flex items-center gap-2">
                                            <Repeat className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                            {chore.recurrence || "One-time"}
                                        </div>

                                        {/* ACTIONS */}
                                        <div className="col-span-2 flex justify-end pr-3">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteChore(chore.chore_id)}
                                                className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
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