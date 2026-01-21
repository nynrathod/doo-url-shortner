import { useAnalytics } from "@/hooks/use-analytics";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { AreaChart } from "@/components/ui/area-chart";
import { BarChart3 } from "lucide-react";
import { Loader } from "@/components/ui/loader";

export default function AnalyticsPage() {
  const { data: analytics, isLoading } = useAnalytics();

  const totalClicks = analytics?.totalClicks || 0;
  const totalLinks = analytics?.totalLinks || 0;
  const activeLinks = analytics?.activeLinks || 0;
  const topLinks = analytics?.topLinks || [];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader simple className="w-5 h-5 text-gray-400" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 pb-24 overflow-y-auto">
        {/* Header */}
        <h1 className="text-lg font-semibold text-gray-900 mb-6">Analytics</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-1.5 text-xs text-blue-600 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Clicks
            </div>
            <p className="text-3xl font-semibold text-gray-900 tabular-nums">
              {totalClicks}
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-1.5 text-xs text-purple-600 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              Links
            </div>
            <p className="text-3xl font-semibold text-gray-900 tabular-nums">
              {totalLinks}
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-1.5 text-xs text-green-600 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Active
            </div>
            <p className="text-3xl font-semibold text-gray-900 tabular-nums">
              {activeLinks}
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-gray-900">
              Click Trends (Last 7 Days)
            </h2>
          </div>

          {/* Visx Area Chart */}
          <div className="h-52">
            <AreaChart
              data={(() => {
                const dailyClicks = analytics?.dailyClicks || [];
                // Create a map of day abbreviation to clicks
                const clicksByDay = new Map(
                  dailyClicks.map((d) => [d.day, d.clicks]),
                );

                // Generate all 7 days (going back from today)
                const today = new Date();
                const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                const points = [];

                for (let i = 6; i >= 0; i--) {
                  const date = new Date(today);
                  date.setDate(today.getDate() - i);
                  date.setHours(12, 0, 0, 0);
                  const dayAbbr = days[date.getDay()];
                  const clicks = clicksByDay.get(dayAbbr) || 0;
                  points.push({ date, value: clicks });
                }

                return points;
              })()}
              height={200}
            />
          </div>
        </div>

        {/* Top Links */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-sm font-medium text-gray-900">Top Links</h2>
          </div>

          {topLinks && topLinks.length > 0 ? (
            <div>
              {topLinks.map((link, index) => (
                <div
                  key={link.id}
                  className="flex items-center gap-4 px-4 py-2.5 hover:bg-gray-50 border-t border-gray-50 first:border-t-0"
                >
                  <span className="w-5 text-xs text-gray-400 tabular-nums">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">
                      /{link.ShortCode}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 tabular-nums">
                    <BarChart3 className="w-3 h-3" />
                    {link.ClickCount}
                  </div>
                  <div className="w-20 h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{
                        width: `${totalClicks > 0 ? (link.ClickCount / totalClicks) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-4 py-8 text-center text-sm text-gray-500">
              No links yet. Create your first link to see analytics.
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
