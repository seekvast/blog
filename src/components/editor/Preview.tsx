import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { cn } from "@/lib/utils";
import { formatterApi } from "@/services/formatter";
import { debounce } from "@/lib/utils";

interface PreviewProps {
  content: string;
  className?: string;
}

export function Preview({ content, className }: PreviewProps) {
  const [serverHtml, setServerHtml] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  // 使用防抖进行服务器端解析
  const debouncedServerParse = React.useCallback(
    debounce(async (text: string) => {
      try {
        setIsLoading(true);
        const html = await formatterApi.preview(text);
        setServerHtml(html);
      } catch (error) {
        console.error('Failed to parse markdown:', error);
      } finally {
        setIsLoading(false);
      }
    }, 1000),
    []
  );

  // 当内容变化时，触发服务器端解析
  React.useEffect(() => {
    if (content.length > 100) { // 只有内容较长时才使用服务器解析
      debouncedServerParse(content);
    } else {
      setServerHtml(null);
    }
  }, [content, debouncedServerParse]);

  return (
    <div
      className={cn(
        "prose prose-sm dark:prose-invert max-w-none",
        "min-h-[200px] p-3 rounded-md border bg-muted",
        isLoading && "opacity-50",
        className
      )}
    >
      {serverHtml ? (
        // 使用服务器解析的 HTML
        <div dangerouslySetInnerHTML={{ __html: serverHtml }} />
      ) : (
        // 使用客户端解析
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeSanitize]}
          components={{
            img: ({ node, ...props }) => (
              <img className="rounded-md max-h-96" {...props} />
            ),
            a: ({ node, ...props }) => (
              <a className="text-primary hover:underline" {...props} />
            ),
            code: ({ node, inline, ...props }) =>
              inline ? (
                <code className="bg-muted px-1 py-0.5 rounded" {...props} />
              ) : (
                <code className="block bg-muted p-2 rounded" {...props} />
              ),
          }}
        >
          {content}
        </ReactMarkdown>
      )}
    </div>
  );
}
