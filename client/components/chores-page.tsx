"use client"

import { useState, useEffect, useMemo} from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListChecks, Trash2, PlusCircle, Loader2, Repeat, Calendar, AlignLeft, User, CheckCircle, Edit, X } from "lucide-react";
import { EditChoreForm } from './ui/EditChoreForm';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE || ''; 

interface Chore {
    chore_id: number;
    title: string;
    due_date: string | null;
    home_id: number;
    description: string | null;
    recurrence: string | null;
    user_id: number | null;
    is_completed: 0 | 1 | null ;
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
interface ChoreFormData {
    title: string;
    description: string;
    due_date: string;
    recurrence: string;
}

export function ChorePage({homeId}: ChorePageProps) {
    const [chores, setChores] = useState<Chore[]>([]);
    const [newChoreTitle, setnewChoreTitle] = useState('');
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [editingChoreId, setEditingChoreId] = useState<number | null>(null);
    const [formData, setFormData] = useState<ChoreFormData>({ 
        title: '', 
        description: '', 
        due_date: '', 
        recurrence: '' 
    });
    const [isUpdating, setIsUpdating] = useState(false);

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

    // update chore handlers
    const startEditing = (chore: Chore) => {
        setEditingChoreId(chore.chore_id);
        setFormData({
            title: chore.title || '',
            description: chore.description || '',
            // yyyy-mm-dd
            due_date: chore.due_date ? new Date(chore.due_date).toISOString().split('T')[0] : '', 
            recurrence: chore.recurrence || 'One-time',
        });
        setError(null);
    };
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    const handleUpdateChore = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingChoreId || !formData.title.trim()) return;
        setIsUpdating(true);
        setError(null);
        const updatedChoreData = {
            title: formData.title.trim(),
            description: formData.description.trim() || null,
            due_date: formData.due_date || null,
            recurrence: formData.recurrence || null,
        };
        try {
            const res = await fetch(`${API_BASE_URL}/chore/${editingChoreId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedChoreData),
            });
            const data = await res.json();

            if (res.ok && data.success) {
                setChores(prev => prev.map(c =>
                    c.chore_id === editingChoreId
                        ? { ...c, ...updatedChoreData } as Chore 
                        : c
                ));
                setEditingChoreId(null);
            } else {
                throw new Error(data.message || "Failed to update chore.");
            }
        } catch (err) {
            console.error("Update Chore failed:", err);
            setError("Error updating chore.");
        } finally {
            setIsUpdating(false);
        }
    };
    const cancelEditing = () => {
        setEditingChoreId(null);
        setIsUpdating(false);
    };
    // search 
    const searchChores = useMemo(() => {
        if (!searchTerm) {
            return chores;
        }
        const lowerCaseSearch = searchTerm.toLowerCase();

        return chores.filter(chore => {
            const titleMatch = chore.title.toLowerCase().includes(lowerCaseSearch);
            
            const descriptionMatch = chore.description 
                ? chore.description.toLowerCase().includes(lowerCaseSearch)
                : false;
            
            return titleMatch || descriptionMatch;
        });
    }, [chores, searchTerm]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900 flex flex-col items-center p-8">
            <Card className="w-full max-w-5xl shadow-2xl border-orange-100 dark:border-blue-800 relative z-10">
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
                    {/* Search Bar */}
                    <div className="relative">
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <Input
                            type="text"
                            placeholder="Search chores by name or description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 bg-white dark:bg-blue-900/30 border-orange-200 dark:border-blue-800 focus:ring-orange-500 dark:focus:ring-orange-400"
                        />
                    </div>
                    {/* Chore List Display */}
                    <div className="space-y-3 pt-4">
                        {/* 2. Render List with Columns */}
                        {searchChores.length > 0 && (
                            <div className="grid grid-cols-12 font-semibold text-xs text-muted-foreground uppercase py-2 border-b dark:border-blue-800/50">
                                <div className="col-span-3 pl-3">Chore</div>
                                <div className="col-span-2">Due Date</div>
                                <div className="col-span-2">Recurrence</div>
                                <div className="col-span-2">Assigned To</div>
                                <div className="col-span-2">Status</div>
                                <div className="col-span-1 text-right pr-3"></div> {/* Actions column */}
                            </div>
                        )}

                        {loading ? (
                            <div className="flex items-center justify-center p-8 text-muted-foreground">
                                <Loader2 className="w-6 h-6 mr-2 animate-spin" /> Loading Chores...
                            </div>
                        ) : searchChores.length === 0 ? (
                            // 2. Updated Empty/No Results Messages
                            <p className="text-center text-muted-foreground p-8">
                                {searchTerm ? `No chores found matching "${searchTerm}".` : "No chores yet! Add the first task above."}
                            </p>
                        ): (
                                <ul className="space-y-2">
                                    {searchChores.map((chore) => (
                                        // 1. Conditional rendering: Show form OR static details
                                        chore.chore_id === editingChoreId ? (
                                            <EditChoreForm
                                            key={chore.chore_id}
                                            formData={formData}
                                            isUpdating={isUpdating}
                                            handleFormChange={handleFormChange}
                                            handleUpdateChore={handleUpdateChore}
                                            cancelEditing={cancelEditing}
                                            />
    
                                        ) : (
                                            // --- STATIC CHORE DISPLAY ---
                                            <li key={chore.chore_id} className="grid grid-cols-12 items-center p-3 bg-white dark:bg-blue-900/10 border border-orange-100 dark:border-blue-800/50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                                
                                                {/* TITLE & DESCRIPTION */}
                                                <div className="col-span-3 flex flex-col pl-3">
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
                                                <div className="col-span-2 text-sm flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-orange-500 dark:text-amber-400" />
                                                    {formatDate(chore.due_date)}
                                                </div>

                                                {/* RECURRENCE */}
                                                <div className="col-span-2 text-sm flex items-center gap-2">
                                                    <Repeat className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                    {chore.recurrence || "One-time"}
                                                </div>

                                                {/* ASSIGNED TO */}
                                                <div className="col-span-2 text-sm flex items-center gap-2">
                                                    <User className={`w-4 h-4 ${chore.user_id ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`} />
                                                    <span className={chore.user_id ? 'font-medium' : 'text-muted-foreground italic'}>
                                                        {chore.user_id ? `User ID: ${chore.user_id}` : 'Unassigned'}
                                                    </span>
                                                </div>

                                                {/* STATUS */}
                                                <div className="col-span-2 text-sm flex items-center gap-2">
                                                    {chore.is_completed === 1 ? (
                                                        <>
                                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                                            <span className="text-green-600 font-semibold">Complete</span>
                                                        </>
                                                    ) : chore.is_completed === 0 ? (
                                                        <>
                                                            <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
                                                            <span className="text-amber-600">Pending</span>
                                                        </>
                                                    ) : (
                                                        <span className="text-muted-foreground italic">No Status</span>
                                                    )}
                                                </div>

                                                {/* ACTIONS COLUMN */}
                                                <div className="col-span-1 flex justify-end pr-3 gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => startEditing(chore)}
                                                        className="text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2 h-8 w-8"
                                                        disabled={isUpdating}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteChore(chore.chore_id)}
                                                        className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 h-8 w-8"
                                                        disabled={isUpdating}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </li>
                                        )
                                    ))}
                                </ul>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
}