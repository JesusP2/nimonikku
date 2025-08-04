interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  const renderMarkdown = (markdown: string) => {
    const lines = markdown.split('\n');
    const elements: JSX.Element[] = [];
    let currentList: string[] = [];
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];

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
          <h1 key={index} className="text-2xl font-bold mb-3 mt-4 first:mt-0">
            {line.slice(2)}
          </h1>
        );
        return;
      }
      
      if (line.startsWith('## ')) {
        flushList();
        elements.push(
          <h2 key={index} className="text-xl font-semibold mb-2 mt-3 first:mt-0">
            {line.slice(3)}
          </h2>
        );
        return;
      }
      
      if (line.startsWith('### ')) {
        flushList();
        elements.push(
          <h3 key={index} className="text-lg font-medium mb-2 mt-3 first:mt-0">
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

      // Handle horizontal rules
      if (line.match(/^---+$/) || line.match(/^\*\*\*+$/)) {
        flushList();
        elements.push(<hr key={index} className="my-4 border-muted-foreground/20" />);
        return;
      }

      // Handle blockquotes
      if (line.startsWith('> ')) {
        flushList();
        elements.push(
          <blockquote key={index} className="border-l-4 border-muted-foreground/30 pl-4 italic mb-3 text-muted-foreground">
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
          <p key={index} className="mb-2 text-sm leading-relaxed">
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
        <p key={index} className="mb-2 text-sm leading-relaxed">
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
    <div className={`prose prose-sm max-w-none dark:prose-invert ${className}`}>
      {renderMarkdown(content)}
    </div>
  );
}