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
        <ul className="space-y-1">
          {chores.map((c) => (
            <li key={c.chore_id}>
              {c.description} — <em>{c.status}</em>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
