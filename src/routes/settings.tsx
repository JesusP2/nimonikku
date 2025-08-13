import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@livestore/react";
import { useQuery } from "@livestore/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { events, tables } from "@/server/livestore/schema";
import { userSettings$ } from "@/lib/livestore/queries";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { store } = useStore();
  const settings = useQuery(userSettings$)?.[0];

  const onToggle = (checked: boolean) => {
    if (!settings) {
      store.commit(events.settingsCreated({
        id: window.crypto.randomUUID(),
        userId: "session",
        enableAI: checked,
      }))
    } else {
      store.commit(events.toggleAIGlobalSetting({
        id: settings.id,
        enableAI: checked,
      }))
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold">App Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>AI Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="ai-q-rephrase" className="text-base">Enable AI Question Rephrasing</Label>
              <p className="text-sm text-muted-foreground">When enabled, questions may be rephrased using AI for variety. Requires internet.</p>
            </div>
            <Switch id="ai-q-rephrase" checked={!!settings.enableAI} onCheckedChange={onToggle} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
