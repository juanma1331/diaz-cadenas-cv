import CVDashboardHeader from "./cv-dashboard-header";
import CVDashboard from "./cv-dashboard/dashboard";

export default function CVDashboardPage() {
  return (
    <>
      <CVDashboardHeader />

      <main className="px-6 overflow-hidden">
        <CVDashboard date={new Date().toISOString()} />
      </main>
    </>
  );
}
