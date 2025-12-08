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
    <div className="bg-white dark:bg-slate-800 border-2 border-orange-200 dark:border-slate-700 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
    <h2 className="text-2xl font-bold mb-4">
    <Link
        href="/bills"
        className="hover:underline bg-gradient-to-r from-blue-700 to-orange-600 dark:from-orange-300 dark:to-amber-300 bg-clip-text text-transparent"
    >
        Bills
    </Link>
    </h2>

      {sorted.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No upcoming bills.</p>
      ) : (
        <ul className="space-y-3">
          {sorted.map((b) => {
            const days = daysUntil(b.due_date);

            let color = "text-green-600 dark:text-green-400";
            if (days < 3) color = "text-red-600 dark:text-red-400";
            else if (days < 7) color = "text-yellow-600 dark:text-yellow-400";

            return (
              <li key={b.bill_id} className="text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0">
                <span className="font-medium text-lg">{b.description}</span>
                {" — "}
                <span className="font-semibold text-orange-600 dark:text-amber-400">
                  Your share: ${b.user_amount_due || b.total_amount}
                </span>
                {b.user_amount_due && b.user_amount_due !== b.total_amount && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {" "}(Total: ${b.total_amount})
                  </span>
                )}

                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Type: {b.bill_type} · Due: {b.due_date}
                  {b.user_payment_status && (
                    <> · Status: <span className={`font-medium ${
                      b.user_payment_status === 'paid' ? 'text-green-600 dark:text-green-400' : 
                      b.user_payment_status === 'partial' ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-red-600 dark:text-red-400'
                    }`}>{b.user_payment_status}</span></>
                  )}
                </div>

                <div className={`text-sm font-semibold ${color} mt-1`}>
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
