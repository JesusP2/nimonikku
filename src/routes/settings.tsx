import { useQuery, useStore } from "@livestore/react";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { UserMenu } from "@/components/user-menu";
import { buttonVariants } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { userSettings$ } from "@/lib/livestore/queries";
import { events } from "@/server/livestore/schema";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session.data?.session || session.data.user.isAnonymous) {
      throw redirect({
        to: "/"
      });
    }
  },
});

function SettingsPage() {
  const { store } = useStore();
  const { data: user } = useUser();
  const settings = useQuery(userSettings$(user.id))?.[0];

  const onToggle = (checked: boolean) => {
    if (!settings) {
      store.commit(
        events.settingsCreated({
          id: window.crypto.randomUUID(),
          userId: user.id,
          enableAI: checked,
        }),
      );
    } else {
      store.commit(
        events.toggleAIGlobalSetting({
          id: settings.id,
          enableAI: checked,
        }),
      );
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Link
          to="/"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Link>
        <div className="flex-1">
          <h1 className="font-bold text-3xl">App Settings</h1>
        </div>
        <UserMenu />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>AI Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="ai-q-rephrase" className="text-base">
                Enable AI Question Rephrasing
              </Label>
              <p className="text-muted-foreground text-sm">
                When enabled, questions may be rephrased using AI for variety.
                Requires internet.
              </p>
            </div>
            <Switch
              id="ai-q-rephrase"
              checked={!!settings.enableAI}
              onCheckedChange={onToggle}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
