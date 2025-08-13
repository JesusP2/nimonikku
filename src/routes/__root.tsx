import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Link, Outlet } from "@tanstack/react-router";
import type { trpc } from "@/utils/trpc";
import "../index.css";

export interface RouterAppContext {
  trpc: typeof trpc;
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootComponent,
});

function RootComponent() {
  return (
    <div className="min-h-screen">
      <div className="p-3 border-b">
        <div className="max-w-7xl mx-auto flex items-center gap-3 text-sm">
          <Link to="/">Home</Link>
          <span className="text-muted-foreground">/</span>
          <Link to="/settings">Settings</Link>
        </div>
      </div>
      <Outlet />
    </div>
  );
}
