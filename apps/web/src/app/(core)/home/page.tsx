import Dashboard from "./dashboard";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    // Supabase client runs on client; redirect to login and let client fetch user
    // For now, render the dashboard shell; the client component will handle session
    return (
        <div>
            <h1>Dashboard</h1>
            <Dashboard />
        </div>
    );
}
