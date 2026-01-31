import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

interface Props {
  content: string;
  isUser?: boolean;
  timestamp?: Date;
  model?: string;
}

export function Message({ content, isUser = false, timestamp, model }: Props) {
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className="max-w-full">
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-transparent text-foreground"
          }`}
        >
          {isUser ? (
            <div className="whitespace-pre-wrap">{content}</div>
          ) : (
            <div
              className="prose prose-sm max-w-none dark:prose-invert
              prose-p:leading-relaxed
              prose-pre:bg-muted
              prose-pre:rounded-lg
              prose-pre:p-4
              prose-code:bg-muted/60
              prose-code:px-1
              prose-code:rounded"
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {!isUser && timestamp && (
          <div className="mt-1 text-xs text-muted-foreground">
            {model && <span className="mr-1">{model}</span>}•{" "}
            {timestamp.toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
}
