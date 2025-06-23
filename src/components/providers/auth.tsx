import { AuthUIProvider } from "@daveyplate/better-auth-ui";
import { authClient } from "@/lib/auth-client";
import { Link } from "@tanstack/react-router";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthUIProvider
      authClient={authClient}
      Link={NavLink}
      magicLink
      passkey
      oneTap
      providers={["google"]}
    >
      {children}
    </AuthUIProvider>
  );
}

function NavLink({ href, children }: any) {
  return <Link to={href}>{children}</Link>;
}
