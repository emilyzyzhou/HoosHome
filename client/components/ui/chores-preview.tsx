import { Chore } from "@/types/dashboard";

interface Props {
  chores: Chore[];
}

export default function ChoresPreview({ chores }: Props) {
  return (
    <div className="border rounded-lg p-4 shadow-sm">
      <h2 className="text-xl font-bold mb-2">Chores</h2>

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
