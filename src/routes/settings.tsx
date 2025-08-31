import { useQuery, useStore } from "@livestore/react";
import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { userSettings$ } from "@/lib/livestore/queries";
import { events } from "@/server/livestore/schema";
import { useSession } from "@/hooks/use-session";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { store } = useStore();
  const session = authClient.useSession();
  const settings = useQuery(userSettings$(session.data?.user?.id))?.[0];

  const onToggle = (checked: boolean) => {
    if (!settings) {
      store.commit(
        events.settingsCreated({
          id: window.crypto.randomUUID(),
          userId: "user1",
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
    <div className="mx-auto max-w-3xl space-y-6 py-8">
      <h1 className="font-bold text-3xl">App Settings</h1>
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
