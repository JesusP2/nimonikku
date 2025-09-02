import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/api/auth/callback/google")({
  component: RouteComponent,
});

function RouteComponent() {
  const query = useQuery({
    queryKey: ["/api/auth/callback/google"],
    queryFn: async () => {
      const response = await fetch(
        `/api/auth/callback/google${window.location.search}`,
      );
      if (response.ok) {
        window.location.href = "/";
      }
    },
  });
  if (query.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Alert variant="default">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Authenticating...</AlertTitle>
            <AlertDescription />
          </Alert>
        </div>
      </div>
    );
  }
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Alert variant="default">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Failed</AlertTitle>
          <AlertDescription>
            Failed to authenticate with Google, this account may already be
            linked to another user.
            <Link
              to="/auth/$id"
              params={{ id: "sign-in" }}
              className={buttonVariants({
                variant: "link",
                className: "pl-0",
              })}
            >
              Go to sign in
            </Link>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
