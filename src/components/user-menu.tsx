import { Link } from "@tanstack/react-router";
import { LogIn, LogOut, Settings, User } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { isUserAuthenticated, useUser } from "@/hooks/use-user";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export function UserMenu() {
  const { data: user } = useUser();

  const handleLogout = async () => {
    await authClient.signOut();
    window.location.reload();
  };

  if (!isUserAuthenticated(user)) {
    return (
      <Link
        to="/auth/$id"
        params={{ id: 'sign-in' }}
        className={cn(
          buttonVariants({ variant: "default", size: "sm" }),
          "gap-2"
        )}
      >
        <LogIn className="h-4 w-4" />
        Sign In
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "gap-2"
        )}
      >
        <User className="h-4 w-4" />
        {user.name || user.email || "User"}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link to="/settings" className="flex w-full items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2">
          <LogOut className="h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
