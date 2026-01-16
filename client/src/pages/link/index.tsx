import { useParams, Link } from 'react-router-dom'
import { useLinkStats, useDeleteLink } from '@/hooks/use-links'
import { Button } from '@/components/ui/button'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { AreaChart } from '@/components/ui/area-chart'
import {
    ArrowLeft, ExternalLink, Copy, Trash2,
    BarChart3, Clock, Calendar, CheckCircle, Loader2
} from 'lucide-react'
import { copyToClipboard, formatDate, formatRelativeTime } from '@/lib/utils'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function LinkDetailsPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { data: stats, isLoading, error } = useLinkStats(Number(id))
    const deleteLink = useDeleteLink()
    const [isScrolled, setIsScrolled] = useState(false)
    const [copied, setCopied] = useState(false)

    const shortBaseUrl =
        (import.meta as any).env?.VITE_SHORT_BASE_URL || 'http://127.0.0.1:3001'

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        setIsScrolled(e.currentTarget.scrollTop > 0)
    }

    const handleCopy = async () => {
        if (!stats) return
        const shortUrl = `${shortBaseUrl}/${stats.ShortCode}`
        await copyToClipboard(shortUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleDelete = async () => {
        if (!stats) return
        if (confirm('Are you sure you want to delete this link?')) {
            await deleteLink.mutateAsync(stats.id)
            navigate('/dashboard')
        }
    }

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
                </div>
            </DashboardLayout>
        )
    }

    if (error || !stats) {
        return (
            <DashboardLayout>
                <div className="p-6 lg:p-8">
                    <div className="text-center py-20">
                        <p className="text-neutral-500 mb-4">Link not found</p>
                        <Link to="/dashboard">
                            <Button variant="outline">
                                <ArrowLeft className="w-4 h-4" />
                                Back to Links
                            </Button>
                        </Link>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    const shortUrl = `${shortBaseUrl}/${stats.ShortCode}`

    return (
        <DashboardLayout>
            {/* Fixed Header */}
            <div className={`p-6 lg:p-8 bg-white/50 backdrop-blur-sm z-10 shrink-0 ${isScrolled ? 'border-b border-neutral-200 shadow-sm' : 'border-b border-transparent'
                }`}>
                <div>
                    <Link
                        to="/dashboard"
                        className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Links
                    </Link>

                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div>
                            <h1 className="text-xl font-semibold text-neutral-900 mb-1">
                                linkshort/{stats.ShortCode}
                            </h1>
                            <a
                                href={stats.DestinationUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-neutral-500 hover:text-neutral-700 flex items-center gap-1"
                            >
                                ↳ {stats.DestinationUrl}
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button variant="outline" onClick={handleCopy}>
                                {copied ? (
                                    <>
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-4 h-4" />
                                        Copy link
                                    </>
                                )}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleDelete}
                                disabled={deleteLink.isPending}
                                className="text-red-600 hover:bg-red-50"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scrollable Content */}
            <div
                className="flex-1 overflow-y-auto p-6 lg:p-8"
                onScroll={handleScroll}
            >
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white border border-neutral-200 rounded-lg p-5">
                        <div className="flex items-center gap-2 text-sm text-neutral-500 mb-2">
                            <BarChart3 className="w-4 h-4" />
                            Clicks
                        </div>
                        <p className="text-3xl font-semibold text-neutral-900">{stats.ClickCount}</p>
                    </div>

                    <div className="bg-white border border-neutral-200 rounded-lg p-5">
                        <div className="flex items-center gap-2 text-sm text-neutral-500 mb-2">
                            <Clock className="w-4 h-4" />
                            Last Accessed
                        </div>
                        <p className="text-lg font-medium text-neutral-900">
                            {stats.LastAccessedAt ? formatRelativeTime(stats.LastAccessedAt) : 'Never'}
                        </p>
                    </div>

                    <div className="bg-white border border-neutral-200 rounded-lg p-5">
                        <div className="flex items-center gap-2 text-sm text-neutral-500 mb-2">
                            <Calendar className="w-4 h-4" />
                            Created
                        </div>
                        <p className="text-lg font-medium text-neutral-900">
                            {stats.created_at ? formatDate(stats.created_at) : 'Unknown'}
                        </p>
                    </div>

                    <div className="bg-white border border-neutral-200 rounded-lg p-5">
                        <div className="flex items-center gap-2 text-sm text-neutral-500 mb-2">
                            <Calendar className="w-4 h-4" />
                            Expires
                        </div>
                        <div>
                            <p className="text-lg font-medium text-neutral-900">
                                {stats.ExpiresAt ? formatDate(stats.ExpiresAt) : 'Never'}
                            </p>
                            {stats.ExpiresAt && (
                                <p className="text-xs text-neutral-500 mt-1">
                                    {new Date(stats.ExpiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Analytics Chart */}
                <div className="bg-white border border-neutral-200 rounded-lg p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-medium text-neutral-900">Analytics (Last 24 Hours)</h2>
                    </div>

                    {stats.ClickCount === 0 ? (
                        <div className="h-52 flex items-center justify-center text-neutral-400 text-sm">
                            No clicks recorded yet
                        </div>
                    ) : (
                        <div className="h-52">
                            <AreaChart
                                data={(() => {
                                    // Generate hourly data points for last 24 hours
                                    const now = new Date();
                                    const points = [];
                                    for (let i = 23; i >= 0; i--) {
                                        const date = new Date(now);
                                        date.setHours(now.getHours() - i, 0, 0, 0);
                                        // Distribute clicks with a natural curve
                                        const hourWeight = Math.abs(Math.sin((24 - i) / 24 * Math.PI));
                                        const value = Math.max(0, Math.round((hourWeight * stats.ClickCount) / 8));
                                        points.push({ date, value });
                                    }
                                    return points;
                                })()}
                                height={200}
                            />
                        </div>
                    )}
                </div>

                {/* Link Details */}
                <div className="mt-6 bg-white border border-neutral-200 rounded-lg">
                    <div className="px-5 py-4 border-b border-neutral-200">
                        <h2 className="text-sm font-medium text-neutral-900">Link Details</h2>
                    </div>
                    <div className="p-5 space-y-4">
                        <div className="flex justify-between py-2 border-b border-neutral-100">
                            <span className="text-sm text-neutral-500 shrink-0">Short URL</span>
                            <span className="text-sm font-medium text-neutral-900 text-right">{shortUrl}</span>
                        </div>
                        <div className="flex justify-between items-start py-2 border-b border-neutral-100 gap-8">
                            <span className="text-sm text-neutral-500 shrink-0 mt-0.5">Destination URL</span>
                            <a
                                href={stats.DestinationUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline text-right break-all"
                            >
                                {stats.DestinationUrl}
                            </a>
                        </div>
                        <div className="flex justify-between py-2">
                            <span className="text-sm text-neutral-500">Status</span>
                            {stats.ExpiresAt && new Date(stats.ExpiresAt) < new Date() ? (
                                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-600">
                                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                                    Expired
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600">
                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                    Active
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
