import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
      {/* Current Side Indicator & Flip Button */}
      <div className="flex justify-center items-center gap-4">
        <Button onClick={handleFlipCard} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Flip Card ({currentSide === "front" ? "Back" : "Front"})
        </Button>
        <Badge variant={currentSide === "front" ? "default" : "secondary"} className="text-lg px-4 py-2">
          {currentSide === "front" ? "Front Side" : "Back Side"}
        </Badge>
      </div>

      {/* Editor and Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor */}
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

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="min-h-[400px] p-4 border rounded-md bg-muted/20">
              {currentMarkdown.trim() ? (
                <MarkdownPreview content={currentMarkdown} />
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

// Enhanced markdown preview component
function MarkdownPreview({ content }: { content: string }) {
  const renderMarkdown = (markdown: string) => {
    const lines = markdown.split('\n');
    const elements: JSX.Element[] = [];
    let currentList: string[] = [];
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];
    let codeBlockLanguage = '';

    const flushList = () => {
      if (currentList.length > 0) {
        elements.push(
          <ul key={elements.length} className="list-disc pl-6 mb-4 space-y-1">
            {currentList.map((item, idx) => (
              <li key={idx} className="text-sm">{item}</li>
            ))}
          </ul>
        );
        currentList = [];
      }
    };

    const flushCodeBlock = () => {
      if (codeBlockContent.length > 0) {
        elements.push(
          <pre key={elements.length} className="bg-muted p-4 rounded-md mb-4 overflow-x-auto">
            <code className="text-sm font-mono">
              {codeBlockContent.join('\n')}
            </code>
          </pre>
        );
        codeBlockContent = [];
        codeBlockLanguage = '';
      }
    };

    lines.forEach((line, index) => {
      // Handle code blocks
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          flushCodeBlock();
          inCodeBlock = false;
        } else {
          flushList();
          codeBlockLanguage = line.slice(3).trim();
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        return;
      }

      // Handle headers
      if (line.startsWith('# ')) {
        flushList();
        elements.push(
          <h1 key={index} className="text-3xl font-bold mb-4 mt-6 first:mt-0">
            {line.slice(2)}
          </h1>
        );
        return;
      }
      
      if (line.startsWith('## ')) {
        flushList();
        elements.push(
          <h2 key={index} className="text-2xl font-semibold mb-3 mt-5 first:mt-0">
            {line.slice(3)}
          </h2>
        );
        return;
      }
      
      if (line.startsWith('### ')) {
        flushList();
        elements.push(
          <h3 key={index} className="text-xl font-medium mb-2 mt-4 first:mt-0">
            {line.slice(4)}
          </h3>
        );
        return;
      }

      // Handle lists
      if (line.match(/^[\s]*[-*+]\s/)) {
        const listItem = line.replace(/^[\s]*[-*+]\s/, '');
        currentList.push(listItem);
        return;
      }

      // Handle numbered lists
      if (line.match(/^[\s]*\d+\.\s/)) {
        flushList();
        const listItem = line.replace(/^[\s]*\d+\.\s/, '');
        if (currentList.length === 0) {
          elements.push(
            <ol key={elements.length} className="list-decimal pl-6 mb-4 space-y-1">
              <li className="text-sm">{listItem}</li>
            </ol>
          );
        }
        return;
      }

      // Handle horizontal rules
      if (line.match(/^---+$/) || line.match(/^\*\*\*+$/)) {
        flushList();
        elements.push(<hr key={index} className="my-6 border-muted-foreground/20" />);
        return;
      }

      // Handle blockquotes
      if (line.startsWith('> ')) {
        flushList();
        elements.push(
          <blockquote key={index} className="border-l-4 border-muted-foreground/30 pl-4 italic mb-4 text-muted-foreground">
            {line.slice(2)}
          </blockquote>
        );
        return;
      }

      // Handle inline code
      if (line.includes('`')) {
        flushList();
        const parts = line.split('`');
        const formattedLine = parts.map((part, idx) => 
          idx % 2 === 0 ? (
            <span key={idx}>{formatInlineStyles(part)}</span>
          ) : (
            <code key={idx} className="bg-muted px-1 py-0.5 rounded text-sm font-mono">
              {part}
            </code>
          )
        );
        elements.push(
          <p key={index} className="mb-3 text-sm leading-relaxed">
            {formattedLine}
          </p>
        );
        return;
      }

      // Handle empty lines
      if (line.trim() === '') {
        flushList();
        return;
      }

      // Handle regular paragraphs
      flushList();
      elements.push(
        <p key={index} className="mb-3 text-sm leading-relaxed">
          {formatInlineStyles(line)}
        </p>
      );
    });

    // Flush any remaining content
    flushList();
    flushCodeBlock();

    return elements;
  };

  const formatInlineStyles = (text: string) => {
    // Handle bold **text**
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Handle italic *text*
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Handle links [text](url)
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline">$1</a>');
    
    return <span dangerouslySetInnerHTML={{ __html: text }} />;
  };

  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      {renderMarkdown(content)}
    </div>
  );
}