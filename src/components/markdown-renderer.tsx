import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { cn } from '@/lib/utils';

marked.setOptions({
  breaks: true
});

export function MarkdownRenderer({ content, className }: { content: string, className?: string }) {
  const rawHtml = marked(content) as string;
  const sanitizedHtml = DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'strong', 'em', 'u', 's', 'del',
      'a', 'img',
      'ul', 'ol', 'li',
      'blockquote',
      'code', 'pre',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'hr',
      'div', 'span'
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel',
      'src', 'alt', 'title',
      'class', 'id'
    ]
  });

  return (
    <div
      className={cn('prose prose-sm max-w-none dark:prose-invert', className)}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}
