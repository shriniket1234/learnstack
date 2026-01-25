import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css"; // or any other theme

interface MessageProps {
  content: string;
  isUser?: boolean;
  timestamp?: Date;
  model?: string;
}

export function Message({
  content,
  isUser = false,
  timestamp,
  model,
}: MessageProps) {
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`flex items-start gap-3 max-w-[80%] ${isUser ? "flex-row-reverse" : ""}`}
      >
        <div className={`flex-1 space-y-2`}>
          <div
            className={`rounded-lg px-4 py-3 ${
              isUser ? "bg-primary text-primary-foreground" : "bg-muted"
            }`}
          >
            {isUser ? (
              <div className="whitespace-pre-wrap">{content}</div>
            ) : (
              <div className="prose prose-sm max-w-none dark:prose-invert [&_pre]:bg-muted [&_pre]:p-3 [&_pre]:rounded-md [&_pre]:overflow-x-auto [&_code]:text-sm [&_code:not(pre_code)]:bg-muted-foreground/20 [&_code:not(pre_code)]:px-1 [&_code:not(pre_code)]:py-0.5 [&_code:not(pre_code)]:rounded">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                >
                  {content}
                </ReactMarkdown>
              </div>
            )}
          </div>
          {timestamp && !isUser && (
            <div className="text-xs text-muted-foreground">
              {timestamp.toLocaleTimeString()}
              {model && ` • ${model}`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
