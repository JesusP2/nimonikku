import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import ReactDOM from "react-dom/client";
import Loader from "./components/loader";
import { LiveStoreProvider } from "./components/providers/livestore";
import { ThemeProvider } from "./components/providers/theme";
import { Toaster } from "./components/ui/sonner";
import { routeTree } from "./routeTree.gen";
import { queryClient, trpc } from "./utils/trpc";
import { ThemeButton } from "./components/theme-button";

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultPendingComponent: () => <Loader />,
  context: { trpc, queryClient },
  Wrap: function WrapComponent({ children }: { children: React.ReactNode }) {
    return (
      <ThemeProvider>
        <LiveStoreProvider>
          <QueryClientProvider client={queryClient}>
            {children}
            <Toaster richColors />
            <ThemeButton />
            <ReactQueryDevtools
              position="bottom"
              buttonPosition="bottom-right"
            />
          </QueryClientProvider>
        </LiveStoreProvider>
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
