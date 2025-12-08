import { Bill } from "@/types/dashboard";
import Link from "next/link";

interface Props {
  bills: Bill[] | undefined;
}

export default function BillsPreview({ bills }: Props) {
  const safeBills = bills ?? [];

  const sorted = [...safeBills].sort(
    (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
  );

  function daysUntil(dateString: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dateString);
    const diff = due.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  return (
    <div className="border rounded-lg p-4 shadow-sm">
    <h2 className="text-xl font-bold mb-2">
    <Link
        href="/bills"
        className="hover:underline text-blue-700 dark:text-amber-200"
    >
        Bills
    </Link>
    </h2>

      {sorted.length === 0 ? (
        <p className="text-gray-500">No upcoming bills.</p>
      ) : (
        <ul className="space-y-2">
          {sorted.map((b) => {
            const days = daysUntil(b.due_date);

            let color = "text-green-600";
            if (days < 3) color = "text-red-600";
            else if (days < 7) color = "text-yellow-600";

            return (
              <li key={b.bill_id} className="text-gray-800">
                <span className="font-medium">{b.description}</span>
                {" — $"}
                {b.total_amount}

                <div className="text-sm text-gray-600">
                  Type: {b.bill_type} · Due: {b.due_date} · Payer: User{" "}
                  {b.payer_user_id}
                </div>

                <div className={`text-sm font-semibold ${color}`}>
                  Due in {days} day{days === 1 ? "" : "s"}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
