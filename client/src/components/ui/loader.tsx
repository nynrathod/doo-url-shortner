import { useEffect, useState } from "react";
import { Loader2, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface LoaderProps {
  className?: string;
  message?: string;
  fullScreen?: boolean;
  simple?: boolean;
}

export function Loader({
  className,
  message,
  fullScreen = false,
  simple = false,
}: LoaderProps) {
  const [showSlowMessage, setShowSlowMessage] = useState(false);

  useEffect(() => {
    if (simple) return;

    const timer = setTimeout(() => {
      setShowSlowMessage(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, [simple]);

  if (simple) {
    return <Loader2 className={cn("animate-spin", className)} />;
  }

  const handleReload = () => {
    window.location.reload();
  };

  const content = (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4",
        className,
      )}
    >
      <Loader2 className="h-8 w-8 animate-spin text-neutral-900" />
      <div
        className={cn(
          "text-sm text-neutral-500 transition-opacity duration-500 text-center px-4 max-w-xs",
          showSlowMessage ? "opacity-100" : "opacity-0",
        )}
      >
        <p className="mb-2">
          {message || "☁️ Running on free hosting - warming up"}
        </p>
        <p className="text-xs text-neutral-400 mb-4">
          Free hosting may experience slower speeds and occasional latency. This
          is not a service issue.
        </p>
        <Button
          onClick={handleReload}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded transition-colors"
        >
          <RotateCw className="h-3 w-3" />
          Reload Page
        </Button>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
        {content}
      </div>
    );
  }

  return content;
}
