import { Outlet } from "react-router";

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-muted/20 flex flex-col">
      <main className="flex-1 flex justify-center px-4 py-6 flex-col items-center">
        <Outlet />
      </main>
    </div>
  );
}
