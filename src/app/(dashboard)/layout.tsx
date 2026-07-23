import { Sidebar } from "@/components/dashboard/sidebar";

export const metadata = {
  title: "Dashboard | TrendForge AI",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
