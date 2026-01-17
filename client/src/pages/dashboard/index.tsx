import { useState } from "react";
import { Link } from "react-router-dom";
import { useLinks, useDeleteLink } from "@/hooks/use-links";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DashboardLayout from "@/components/layout/dashboard-layout";
import CreateLinkDialog from "@/components/create-link-dialog";
import {
  Search,
  Copy,
  MoreHorizontal,
  BarChart3,
  Loader2,
  CheckCircle,
  Trash2,
  Pencil,
} from "lucide-react";
import { copyToClipboard, formatRelativeTime, cn } from "@/lib/utils";
import type { Link as LinkType } from "@/lib/api";

export default function DashboardPage() {
  const { data: links, isLoading } = useLinks();
  const deleteLink = useDeleteLink();

  const shortBaseUrl =
    (import.meta as any).env?.VITE_SHORT_BASE_URL || "http://127.0.0.1:3001";

  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkType | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState<number | null>(null);
  console.log("links", links);
  const filteredLinks =
    (Array.isArray(links) ? links : [])?.filter(
      (link) =>
        link.ShortCode.toLowerCase().includes(search.toLowerCase()) ||
        link.DestinationUrl.toLowerCase().includes(search.toLowerCase()),
    ) || [];

  const handleCopy = async (link: LinkType) => {
    const shortUrl = `${shortBaseUrl}/${link.ShortCode}`;
    await copyToClipboard(shortUrl);
    setCopiedId(link.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this link?")) {
      await deleteLink.mutateAsync(id);
    }
    setMenuOpen(null);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full p-6 pb-24 lg:pb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-semibold text-gray-900">Links</h1>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="hidden lg:flex"
          >
            Create link
          </Button>
        </div>

        {/* Mobile Floating Action Button */}
        <div className="lg:hidden fixed bottom-6 left-4 right-4 z-[10]">
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="w-full h-12 rounded-full shadow-lg text-base font-medium"
          >
            Create link
          </Button>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by short link or URL"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-sm"
            />
          </div>
        </div>

        {/* Links list */}
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center min-h-0">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        ) : filteredLinks.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center border border-dashed border-gray-200 rounded-lg min-h-0">
            <p className="text-sm text-gray-500 mb-4">No links found</p>
            <Button onClick={() => setIsCreateOpen(true)}>
              Create your first link
            </Button>
          </div>
        ) : (
          <div className="flex-1 min-h-0 flex flex-col">
            <div className="flex-initial min-h-0 overflow-y-auto border border-gray-200 rounded-lg">
              {filteredLinks.map((link, idx) => (
                <div
                  key={link.id}
                  className={cn(
                    "flex items-center gap-4 px-4 py-3 bg-white hover:bg-gray-50 transition-colors",
                    idx !== 0 && "border-t border-gray-100",
                  )}
                >
                  {/* Status dot */}
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  </div>

                  {/* Link info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/link/${link.id}`}
                        className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
                      >
                        linkshort/{link.ShortCode}
                      </Link>
                      <button
                        onClick={() => handleCopy(link)}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {copiedId === link.id ? (
                          <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                    <a
                      href={link.DestinationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 truncate mt-0.5"
                    >
                      ↳ {link.DestinationUrl}
                    </a>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-1 text-xs text-gray-500 tabular-nums">
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>{link.ClickCount} clicks</span>
                  </div>

                  {/* Time */}
                  <div className="text-xs text-gray-400 hidden sm:block">
                    {link.created_at
                      ? formatRelativeTime(link.created_at)
                      : "Just now"}
                  </div>

                  {/* Actions menu */}
                  <div className="relative">
                    <button
                      onClick={() =>
                        setMenuOpen(menuOpen === link.id ? null : link.id)
                      }
                      className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>

                    {menuOpen === link.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setMenuOpen(null)}
                        />
                        <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1 text-sm">
                          <Link
                            to={`/link/${link.id}`}
                            className="flex items-center gap-2 px-3 py-1.5 text-gray-700 hover:bg-gray-50"
                            onClick={() => setMenuOpen(null)}
                          >
                            <BarChart3 className="w-3.5 h-3.5" />
                            Analytics
                          </Link>
                          <button
                            onClick={() => {
                              setEditingLink(link);
                              setMenuOpen(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-gray-700 hover:bg-gray-50"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(link.id)}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex-shrink-0 flex items-center justify-center gap-2 mt-4 mb-4 text-xs text-gray-500">
              Viewing 1-{filteredLinks.length} of {filteredLinks.length} links
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Link Dialog */}
      <CreateLinkDialog
        open={isCreateOpen || !!editingLink}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingLink(null);
        }}
        editLink={editingLink}
      />
    </DashboardLayout>
  );
}
