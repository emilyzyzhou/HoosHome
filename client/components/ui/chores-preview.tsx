import { Chore } from "@/types/dashboard";
import Link from "next/link";

interface Props {
  chores: Chore[];
  homeId: number;
}

export default function ChoresPreview({ chores, homeId }: Props) {
  return (
    <div className="bg-white dark:bg-slate-800 border-2 border-orange-200 dark:border-slate-700 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
      <h2 className="text-2xl font-bold mb-4">
        <Link
          href={`/chore?homeId=${homeId}`}
          className="hover:underline bg-gradient-to-r from-blue-700 to-orange-600 dark:from-orange-300 dark:to-amber-300 bg-clip-text text-transparent"
        >
          Chores
        </Link>
      </h2>

      {chores.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No chores assigned.</p>
      ) : (
        <ul className="space-y-3">
          {chores.map((c: Chore) => (
            <li key={c.chore_id} className="text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2 last:border-0">
              <strong className="text-lg">{c.title}</strong><br />
              <span className="text-gray-600 dark:text-gray-400">{c.description}</span><br />
              <span className="text-sm text-gray-500 dark:text-gray-500">
                Due: {c.due_date || "—"} • Assigned to: {c.assignee || "Unassigned"} • Status: {c.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
