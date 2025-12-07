export interface Roommate {
  user_id: number;
  name: string;
  email: string;
}

export interface Bill {
  bill_id: number;
  description: string;
  bill_type: string;
  total_amount: number;
  due_date: string;
  payer_user_id: number;
}


interface BillPreviewItem {
  bill_id: number;
  description: string;
  bill_type: string;
  total_amount: number;
  due_date: string;
  payer_user_id: number;
}

export default function BillsPreview({
  bills,
}: {
  bills: BillPreviewItem[];
}) {
  return (
    <div className="border rounded-lg p-4 shadow-sm">
      <h2 className="text-xl font-bold mb-2">Bills</h2>

      {!bills || bills.length === 0 ? (
        <p className="text-gray-500">No upcoming bills.</p>
      ) : (
        <ul className="space-y-2">
          {bills.map((b) => (
            <li key={b.bill_id} className="text-gray-800">
              <span className="font-medium">{b.description}</span>
              {" — "} ${b.total_amount}
              <div className="text-sm text-gray-600">
                Type: {b.bill_type} · Due: {b.due_date} · Payer: User {b.payer_user_id}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


export interface EventData {
  event_id: number;
  title: string;
  description: string | null;
  start_date: string;  // YYYY-MM-DD extracted from event_start
  end_date: string | null;
  created_by_user_id: number;
}

export interface Chore {
  chore_id: number;
  title: string;
  description: string;
  due_date: string | null;
  recurrence: string | null;
  assignee: string | null;
  status: string;
}

export interface Lease {
  landlord_name: string;
  start_date: string;
  end_date: string;
  rent_amount: number;
}

interface DashboardData {
  roommates: Roommate[];
  bills: Bill[];
  events: {
    upcoming: EventData[];
    past: EventData[];
  };
  chores: Chore[];
  lease: Lease | null;
}

