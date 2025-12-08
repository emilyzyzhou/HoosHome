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
  lease_id?: number;
  landlord_name: string;
  start_date: string;
  end_date: string;
  rent_amount: number;
}

export interface DashboardData {
  home_id: number;
  join_code: string;
  roommates: Roommate[];
  bills: Bill[];
  events: {
    upcoming: EventData[];
    past: EventData[];
  };
  chores: Chore[];
  lease: Lease | null;
}

