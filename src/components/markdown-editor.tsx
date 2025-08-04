import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { RefreshCw } from "lucide-react";

interface MarkdownEditorProps {
  frontMarkdown: string;
  backMarkdown: string;
  onFrontChange: (value: string) => void;
  onBackChange: (value: string) => void;
}

export function MarkdownEditor({
  frontMarkdown,
  backMarkdown,
  onFrontChange,
  onBackChange,
}: MarkdownEditorProps) {
  const [currentSide, setCurrentSide] = useState<"front" | "back">("front");

  const currentMarkdown = currentSide === "front" ? frontMarkdown : backMarkdown;
  const setCurrentMarkdown = currentSide === "front" ? onFrontChange : onBackChange;

  const handleFlipCard = () => {
    setCurrentSide(currentSide === "front" ? "back" : "front");
  };

  return (
    <>
      <div className="flex justify-center items-center gap-4">
        <Button onClick={handleFlipCard} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Flip Card ({currentSide === "front" ? "Back" : "Front"})
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Markdown Editor</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={currentMarkdown}
              onChange={(e) => setCurrentMarkdown(e.target.value)}
              placeholder={`Enter ${currentSide} side content in Markdown...`}
              className="min-h-[400px] font-mono"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="min-h-[400px] p-4 border rounded-md bg-muted/20">
              {currentMarkdown.trim() ? (
                <MarkdownRenderer content={currentMarkdown} />
              ) : (
                <p className="text-muted-foreground italic">Preview will appear here...</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
