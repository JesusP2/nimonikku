import { AuthCard } from "@daveyplate/better-auth-ui";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export const Route = createFileRoute("/auth/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = useParams({ from: "/auth/$id" });

  return (
    <main className="m-auto grid h-screen max-w-6xl place-items-center">
      <Link
        to="/"
        className={buttonVariants({
          variant: "ghost",
          className: "absolute top-4 left-4",
        })}
      >
        <ArrowLeft className="h-4 w-4" />
        Go back to chat
      </Link>
      <AuthCard pathname={id} />
    </main>
  );
}
