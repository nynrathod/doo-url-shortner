import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import {
  Link2,
  BarChart3,
  LogOut,
  ChevronDown,
  PanelLeft,
  Check,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Drawer, DrawerContent } from "@/components/ui/drawer";

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  {
    section: "Short Links",
    items: [{ label: "Links", href: "/dashboard", icon: Link2 }],
  },
  {
    section: "Insights",
    items: [{ label: "Analytics", href: "/analytics", icon: BarChart3 }],
  },
];

export default function DashboardLayout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [navSheetOpen, setNavSheetOpen] = useState(false);

  // Get current page name for mobile header
  const currentPage =
    location.pathname === "/analytics" ? "Analytics" : "Links";

  return (
    <div className="min-h-screen bg-neutral-200 font-sans text-gray-900 flex">
      {/* Mobile header - Fixed, 48px, white/backdrop */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-12 bg-white/80 backdrop-blur-md  z-50 flex items-center justify-between px-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1 -ml-1 text-gray-500 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
        >
          <PanelLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => setNavSheetOpen(true)}
          className="flex items-center gap-1 font-medium text-sm cursor-pointer"
        >
          <span>{currentPage}</span>
          <ChevronDown className="w-3 h-3 text-gray-500" />
        </button>
        <div className="w-5" /> {/* Spacer for centering */}
      </div>

      {/* Mobile Navigation Bottom Sheet */}
      <Drawer open={navSheetOpen} onOpenChange={setNavSheetOpen}>
        <DrawerContent>
          <div className="p-4 pb-8">
            <div className="space-y-1">
              <button
                onClick={() => {
                  navigate("/dashboard");
                  setNavSheetOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors",
                  location.pathname === "/dashboard" ||
                    location.pathname.startsWith("/link/")
                    ? "bg-green-50 text-green-700"
                    : "text-gray-700 hover:bg-gray-50",
                )}
              >
                <div className="flex items-center gap-3">
                  <Link2 className="w-4 h-4" />
                  <span>Links</span>
                </div>
                {(location.pathname === "/dashboard" ||
                  location.pathname.startsWith("/link/")) && (
                  <Check className="w-4 h-4 text-green-600" />
                )}
              </button>
              <button
                onClick={() => {
                  navigate("/analytics");
                  setNavSheetOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors",
                  location.pathname === "/analytics"
                    ? "bg-green-50 text-green-700"
                    : "text-gray-700 hover:bg-gray-50",
                )}
              >
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-4 h-4" />
                  <span>Analytics</span>
                </div>
                {location.pathname === "/analytics" && (
                  <Check className="w-4 h-4 text-green-600" />
                )}
              </button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 lg:ml-2 lg:my-2 h-screen lg:h-[calc(100vh-16px)] w-64 lg:w-64 bg-[#F5F5F5] lg:rounded-xl  z-50 transition-transform duration-200 ease-in-out flex-shrink-0 flex flex-col",
          !sidebarOpen && "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Header / Workspace Switcher */}
        <div className="p-3">
          <div className="flex items-center gap-2 px-2 mb-3 mt-1">
            <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">DooShort</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-6 overflow-y-auto custom-scrollbar">
          {navItems.map((group) => (
            <div key={group.section}>
              <p className="px-2 mb-2 text-sm text-neutral-500">
                {group.section}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive =
                    location.pathname === item.href ||
                    (item.href === "/dashboard" &&
                      location.pathname.startsWith("/link/"));
                  return (
                    <Link
                      key={item.label}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-sm transition-all duration-200 cursor-pointer",
                        isActive
                          ? "bg-[#DBEAFE]/50 text-blue-600 font-medium"
                          : "text-[#404040] hover:bg-[#E5E5E5] hover:text-black font-normal",
                      )}
                    >
                      <item.icon
                        className={cn(
                          "w-4 h-4",
                          isActive ? "text-blue-600" : "text-gray-500",
                        )}
                      />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-3 bg-[#F5F5F5] lg:rounded-b-xl border-t border-gray-200/50">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center text-xs font-bold text-gray-700">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <p className="text-sm font-semibold text-gray-900 truncate leading-none mb-0.5">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 truncate leading-none">
                {user?.email}
              </p>
            </div>
            <button
              onClick={logout}
              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <div className="px-2 pt-2 border-t border-gray-200/50 mt-1 flex flex-col items-center gap-2 text-center">
            <div className="text-[10px] text-neutral-400">
              Powered by{" "}
              <a
                href="https://github.com/nynrathod/doolang"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-neutral-900 underline hover:text-black"
              >
                DooLang
              </a>
            </div>
            <a
              href="https://github.com/nynrathod/doo-url-shortner"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-neutral-400 hover:text-neutral-600 underline transition-colors"
            >
              View Source Code
            </a>
          </div>
        </div>
      </aside>

      {/* Main Content Area - Island Style */}
      <main className="flex-1 min-w-0 h-screen lg:h-auto lg:my-2 lg:ml-2 lg:mr-2 bg-neutral-200 pt-12 lg:pt-0 overflow-hidden">
        <div className="bg-white h-full lg:h-[calc(100vh-16px)] lg:rounded-xl overflow-y-auto flex flex-col">
          {children}
        </div>
      </main>
    </div>
  );
}
