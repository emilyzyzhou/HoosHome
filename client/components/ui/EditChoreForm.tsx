// components/EditChoreForm.tsx
"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, X } from "lucide-react"; 

interface ChoreFormData {
    title: string;
    description: string;
    due_date: string;
    recurrence: string;
    user_id: string;
    status: string;
}

const recurrenceOptions = ['Daily', 'Weekly', 'Bi-Weekly', 'Monthly', 'Quarterly', 'Yearly', 'One-time'];
const statusOptions = [
    { label: 'Pending', value: 'pending' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Done', value: 'done' }
];

interface EditChoreFormProps {
    formData: ChoreFormData;
    isUpdating: boolean;
    handleFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    handleUpdateChore: (e: React.FormEvent) => Promise<void>;
    cancelEditing: () => void;
    users: {user_id: number, name:string}[];
}

export function EditChoreForm({
    formData,
    isUpdating,
    handleFormChange,
    handleUpdateChore,
    cancelEditing,
    users
}: EditChoreFormProps) {

    return (
        // --- INLINE EDIT FORM JSX ---
        <li className="p-4 bg-amber-50 dark:bg-blue-900/20 border border-amber-200 dark:border-blue-800/50 rounded-lg shadow-lg">
            <form onSubmit={handleUpdateChore} className="space-y-3">
                <div className="flex gap-3">
                    {/* User Select */}
                    <div className="flex-1 space-y-1">
                        <label htmlFor="edit-user" className="text-xs font-medium text-blue-900 dark:text-orange-200">Assigned To</label>
                        <select
                            id="edit-user"
                            name="user_id" 
                            value={formData.user_id}
                            onChange={(e) => {
                    
                                if (e.target.value === "") {
                             
                                    handleFormChange({ ...e, target: { ...e.target, name: 'user_id', value: "" } as typeof e.target });
                                    handleFormChange({ ...e, target: { ...e.target, name: 'status', value: "Pending" } as typeof e.target });
                                   
                                } else {
                                     handleFormChange(e);
                                }
                            }}
                            disabled={isUpdating}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-white dark:bg-blue-900/30 dark:border-blue-800"
                        >
                            <option value="">Unassigned</option>
                            {users.map(user => (
                                <option key={user.user_id} value={user.user_id}>
                                    {user.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Status Select */}
                    <div className="flex-1 space-y-1">
                        <label htmlFor="edit-status" className="text-xs font-medium text-blue-900 dark:text-orange-200">Status</label>
                        <select
                            id="edit-status"
                            name="status" // Matches formData key
                            value={formData.status}
                            onChange={handleFormChange}
                            disabled={isUpdating || !formData.user_id} 
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-white dark:bg-blue-900/30 dark:border-blue-800"
                        >
                            {statusOptions.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
                    {/* Title Input */}
                    <div className="flex-1 space-y-1">
                        <label htmlFor="edit-title" className="text-xs font-medium text-blue-900 dark:text-orange-200">Title *</label>
                        <Input
                            id="edit-title"
                            name="title"
                            value={formData.title}
                            onChange={handleFormChange}
                            required
                            disabled={isUpdating}
                            className="bg-white dark:bg-blue-900/30"
                        />
                    </div>
                    {/* Recurrence Select */}
                    <div className="w-1/4 space-y-1">
                        <label htmlFor="edit-recurrence" className="text-xs font-medium text-blue-900 dark:text-orange-200">Recurrence</label>
                        <select
                            id="edit-recurrence"
                            name="recurrence"
                            value={formData.recurrence}
                            onChange={handleFormChange}
                            disabled={isUpdating}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-white dark:bg-blue-900/30 dark:border-blue-800"
                        >
                            {recurrenceOptions.map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>
                    {/* Due Date Input */}
                    <div className="w-1/4 space-y-1">
                        <label htmlFor="edit-due_date" className="text-xs font-medium text-blue-900 dark:text-orange-200">Due Date</label>
                        <Input
                            id="edit-due_date"
                            name="due_date"
                            type="date"
                            value={formData.due_date}
                            onChange={handleFormChange}
                            disabled={isUpdating}
                            className="bg-white dark:bg-blue-900/30"
                        />
                    </div>
                
                
                {/* Description Textarea */}
                <div className="space-y-1">
                    <label htmlFor="edit-description" className="text-xs font-medium text-blue-900 dark:text-orange-200">Description</label>
                    <textarea
                        id="edit-description"
                        name="description"
                        value={formData.description}
                        onChange={handleFormChange}
                        rows={2}
                        disabled={isUpdating}
                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-white dark:bg-blue-900/30 dark:border-blue-800"
                    />
                </div>
                
                {/* Action Buttons */}
                <div className="flex justify-end gap-2 pt-2">
                    <Button 
                        type="button" 
                        variant="ghost" 
                        onClick={cancelEditing} 
                        disabled={isUpdating}
                        className="text-muted-foreground hover:bg-gray-100 dark:hover:bg-blue-800/50"
                    >
                        <X className="w-4 h-4 mr-1"/> Cancel
                    </Button>
                    <Button 
                        type="submit" 
                        disabled={isUpdating || !formData.title.trim()}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                    >
                        {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Chore'}
                    </Button>
                </div>
            </form>
        </li>
    );
}