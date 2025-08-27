//app/dashboard/layout.tsx

import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/topbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <TopBar />
        <main className="flex-1 p-4 overflow-auto bg-background text-foreground">
          {children}
        </main>
      </div>
    </div>
  );
}