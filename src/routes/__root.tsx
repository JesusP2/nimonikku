import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { AuthProvider } from "../components/providers/auth";
import { ConfirmDialogProvider } from "../components/providers/confirm-dialog";
import { IsOnlineProvider } from "../components/providers/is-online";
import { LiveStoreProvider } from "../components/providers/livestore";
import { ThemeProvider } from "../components/providers/theme";
import { Toaster } from "../components/ui/sonner";
import "../index.css";
import { useUserQueryOptions } from "@/hooks/use-user";
import { queryClient } from "@/utils/query-client";

export interface RouterAppContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootComponent,
  beforeLoad: async () => queryClient.ensureQueryData(useUserQueryOptions()),
});

function RootComponent() {
  return (
    <ThemeProvider>
      <LiveStoreProvider>
        <IsOnlineProvider>
          <AuthProvider>
            <ConfirmDialogProvider>
              <Outlet />
              <Toaster richColors />
            </ConfirmDialogProvider>
          </AuthProvider>
        </IsOnlineProvider>
      </LiveStoreProvider>
    </ThemeProvider>
  );
}
