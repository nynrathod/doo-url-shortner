import { Globe } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50">
      <div className="w-full max-w-[350px] px-4">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center">
            <Globe className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-lg">DooShort</span>
        </div>

        {children}

        <div className="mt-8 text-center space-y-4">
          <p className="text-sm text-neutral-500">
            Written in <a href="https://github.com/nynrathod/doolang" target="_blank" rel="noopener noreferrer" className="font-bold underline text-neutral-900 hover:text-black">DooLang</a> native binary
          </p>
          <a
            href="https://github.com/nynrathod/doo-url-shortner"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-600 underline transition-colors"
          >
            View Source Code
          </a>
        </div>
      </div>
    </div>
  );
}
