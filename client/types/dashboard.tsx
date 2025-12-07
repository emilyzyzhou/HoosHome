export interface Roommate {
  user_id: number;
  name: string;
  email: string;
}

export interface Bill {
  bill_id: number;
  description: string;
  amount_due: number;
  status: string;
}

export interface EventData {
  event_id: number;
  title: string;
  date: string;
}

export interface Chore {
  chore_id: number;
  description: string;
  status: string;
}

export interface Lease {
  landlord_name: string;
  start_date: string;
  end_date: string;
  rent_amount: number;
}

export interface DashboardData {
  roommates: Roommate[];
  bills: Bill[];
  events: EventData[];
  chores: Chore[];
  lease: Lease | null;
}
