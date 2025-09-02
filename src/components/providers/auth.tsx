import { AuthUIProvider } from "@daveyplate/better-auth-ui";
import { Link } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { useUserQueryOptions } from "@/hooks/use-user";
import { useEffect } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useStore } from "@livestore/react";
import { userSettings$ } from "@/lib/livestore/queries";
import { events } from "@/server/livestore/schema";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: user } = useSuspenseQuery(useUserQueryOptions());
  const { store } = useStore();

  useEffect(() => {
    if (!user.id) return;
    const [userSettings] = store.query(userSettings$(user?.id));
    if (!userSettings) {
      store.commit(
        events.settingsCreated({
          id: crypto.randomUUID(),
          userId: user.id,
          enableAI: false,
        }),
      );
    }
  }, [user])


  return (
    <AuthUIProvider
      authClient={authClient}
      Link={NavLink}
      magicLink
      passkey
      providers={["google"]}
    >
      {children}
    </AuthUIProvider>
  );
}

function NavLink({ href, children }: any) {
  return <Link to={href}>{children}</Link>;
}
