import { Chore } from "@/types/dashboard";
import Link from "next/link";

interface Props {
  chores: Chore[];
}

export default function ChoresPreview({ chores }: Props) {
  return (
    <div className="border rounded-lg p-4 shadow-sm">
    <h2 className="text-xl font-bold mb-2">
      <Link
        href="/chores"
        className="hover:underline text-blue-700 dark:text-amber-200"
      >
        Chores
      </Link>
    </h2>

      {chores.length === 0 ? (
        <p className="text-gray-500">No chores assigned.</p>
      ) : (
        <ul className="space-y-3">
          {chores.map((c: Chore) => (
            <li key={c.chore_id} className="text-gray-800">
              <strong>{c.title}</strong><br />
              {c.description}<br />
              <span className="text-sm text-gray-600">
                Due: {c.due_date || "—"} • Assigned to: {c.assignee || "Unassigned"} • Status: {c.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
