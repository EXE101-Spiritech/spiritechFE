import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const HTML_TAG_RE = /<\/?[a-z][\s\S]*>/i;

function isHTML(content: string): boolean {
  return HTML_TAG_RE.test(content);
}

interface Props {
  content: string;
  className?: string;
}

export function ContentRenderer({ content, className = "" }: Props) {
  if (!content) return null;

  if (isHTML(content)) {
    return (
      <div
        className={className}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
