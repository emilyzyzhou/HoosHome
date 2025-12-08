"use client";

import {
  DashboardData,
  Roommate,
  Bill,
  EventData,
  Chore,
  Lease
} from "@/types/dashboard";

import RoommatesPreview from "./roommates-preview";
import BillsPreview from "./bills-preview";
import EventsPreview from "./events-preview";
import ChoresPreview from "./chores-preview";
import LeasePreview from "./lease-preview";

interface DashboardProps {
  data: DashboardData;
}

export default function Dashboard({ data }: DashboardProps) {
  const { roommates, bills, events, chores, lease, home_id } = data;

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      <RoommatesPreview roommates={roommates} />
      <BillsPreview bills={bills} />
      <EventsPreview events={events} />
      <ChoresPreview chores={chores} homeId={home_id} />
      <LeasePreview lease={lease} homeId={home_id} />
    </div>
  );
}
