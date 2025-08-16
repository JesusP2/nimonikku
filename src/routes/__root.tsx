import type { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  Link,
  Outlet,
} from "@tanstack/react-router";
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
      <div className="border-b p-3">
        <div className="mx-auto flex max-w-7xl items-center gap-3 text-sm">
          <Link to="/">Home</Link>
          <span className="text-muted-foreground">/</span>
          <Link to="/settings">Settings</Link>
        </div>
      </div>
      <Outlet />
    </div>
  );
}
