import { requireAdminSession } from "@/lib/auth";
import AdminEventsView from "@/components/AdminEventsView";

export default async function AdminEventsPage() {
  await requireAdminSession();

  return <AdminEventsView />;
}
