import { scan } from "react-scan";
import "@excalidraw/excalidraw/index.css";
// @ts-expect-error
import "@fontsource-variable/geist";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import ReactDOM from "react-dom/client";
import Loader from "./components/loader";
import { AuthProvider } from "./components/providers/auth";
import { ConfirmDialogProvider } from "./components/providers/confirm-dialog";
import { IsOnlineProvider } from "./components/providers/is-online";
import { LiveStoreProvider } from "./components/providers/livestore";
import { ThemeProvider } from "./components/providers/theme";
import { Toaster } from "./components/ui/sonner";
import { routeTree } from "./routeTree.gen";
import { queryClient } from "./utils/query-client";
import { QueryClientProvider } from "@tanstack/react-query";

// if (import.meta.env.DEV) {
//   scan({
//     enabled: import.meta.env.DEV,
//   });
// }

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultPendingComponent: () => <Loader />,
  context: { queryClient },
  Wrap: function WrapComponent({ children }: { children: React.ReactNode }) {
    return (
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <LiveStoreProvider>
            <IsOnlineProvider>
              <AuthProvider>
                <ConfirmDialogProvider>
                  {children}
                  <Toaster richColors />
                </ConfirmDialogProvider>
              </AuthProvider>
            </IsOnlineProvider>
          </LiveStoreProvider>
        </QueryClientProvider>
      </ThemeProvider>
    );
  },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("app");

if (!rootElement) {
  throw new Error("Root element not found");
}

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<RouterProvider router={router} />);
}
