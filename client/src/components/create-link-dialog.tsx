import { useState, useEffect } from "react";
import { useCreateLink, useUpdateLink } from "@/hooks/use-links";
import type { Link as LinkType } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { X, Globe, Calendar as CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isSameDay, startOfToday } from "date-fns";
import { useMediaQuery } from "@/hooks/use-media-query";

interface CreateLinkDialogProps {
  open: boolean;
  onClose: () => void;
  editLink?: LinkType | null;
}

export default function CreateLinkDialog({
  open,
  onClose,
  editLink,
}: CreateLinkDialogProps) {
  const createLink = useCreateLink();
  const updateLink = useUpdateLink();
  const isEditMode = !!editLink;
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const [destinationUrl, setDestinationUrl] = useState("");

  // Expiration state
  const [expiresEnabled, setExpiresEnabled] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState("23:59");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [shouldRender, setShouldRender] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (open) {
      // Small timeout to allow render before animation starts?
      // Or just set state. If this causes duplicate render, it's unavoidable for mount animation pattern.
      // But the warning says "synchronously within an effect".
      // We can use requestAnimationFrame to make it async but still fast.
      requestAnimationFrame(() => setShouldRender(true));
    } else {
      setIsVisible(false);
    }
  }, [open]);

  useEffect(() => {
    if (shouldRender && open) {
      // Small timeout to ensure DOM is painted with initial state
      const timer = setTimeout(() => setIsVisible(true), 20);
      return () => clearTimeout(timer);
    }
  }, [shouldRender, open]);

  // Pre-fill form when editing
  useEffect(() => {
    if (editLink && open) {
      setDestinationUrl(editLink.DestinationUrl);
      if (editLink.ExpiresAt) {
        setExpiresEnabled(true);
        const expDate = new Date(editLink.ExpiresAt);
        setSelectedDate(expDate);
        setSelectedTime(expDate.toTimeString().slice(0, 5));
      }
    }
  }, [editLink, open]);

  useEffect(() => {
    if (!expiresEnabled || !selectedDate) return;
    const now = new Date();
    if (!isSameDay(selectedDate, now)) return;

    const minTime = format(now, "HH:mm");
    if (selectedTime < minTime) {
      setSelectedTime(minTime);
    }
  }, [expiresEnabled, selectedDate, selectedTime]);

  const onAnimationEnd = () => {
    if (!open) setShouldRender(false);
  };

  const resetForm = () => {
    setDestinationUrl("");

    setExpiresEnabled(false);
    setSelectedDate(undefined);
    setSelectedTime("23:59");
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!destinationUrl.trim()) {
      newErrors.destinationUrl = "Destination URL is required";
    } else {
      try {
        new URL(destinationUrl);
      } catch {
        newErrors.destinationUrl = "Please enter a valid URL";
      }
    }

    if (expiresEnabled) {
      if (!selectedDate) {
        newErrors.expires = "Please select a date";
      } else {
        const dateTime = new Date(selectedDate);
        const [hours, minutes] = selectedTime.split(":").map(Number);
        dateTime.setHours(hours, minutes);
        if (dateTime.getTime() <= Date.now()) {
          newErrors.expires = "Expiration must be in the future";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    let expiresAtStr: string | undefined = undefined;
    if (expiresEnabled && selectedDate) {
      const dateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(":").map(Number);
      dateTime.setHours(hours, minutes);
      expiresAtStr = dateTime.toISOString();
    }

    try {
      if (isEditMode && editLink) {
        await updateLink.mutateAsync({
          id: editLink.id,
          data: {
            destinationurl: destinationUrl,
            expiresat: expiresAtStr,
          },
        });
      } else {
        await createLink.mutateAsync({
          destinationurl: destinationUrl,
          expiresat: expiresAtStr,
        });
      }
      handleClose();
    } catch (error) {
      setErrors({
        submit: isEditMode
          ? "Failed to update link."
          : "Failed to create link. Short code might be taken.",
      });
    }
  };

  // Common form content
  const formContent = (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Destination URL
        </label>
        <Input
          placeholder="https://example.com/long-url"
          value={destinationUrl}
          onChange={(e) => setDestinationUrl(e.target.value)}
          error={errors.destinationUrl}
          className="focus-visible:ring-black"
        />
      </div>

      {/* Expiration Toggle / Fields */}
      <div className="pt-2 border-t border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              Expiration Date
            </span>
          </div>
          <Switch
            checked={expiresEnabled}
            onCheckedChange={setExpiresEnabled}
            className="data-[state=checked]:bg-black"
          />
        </div>

        {expiresEnabled && (
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700">
                  Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      className={cn(
                        "w-full flex items-center justify-start text-left font-normal h-9 px-3 rounded-md border border-gray-200 bg-white text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black/5 transition-all outline-none",
                        !selectedDate && "text-gray-500",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? (
                        format(selectedDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      value={selectedDate}
                      onChange={setSelectedDate}
                      minDate={startOfToday()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700">
                  Time
                </label>
                <Input
                  type="time"
                  className="bg-white h-9"
                  value={selectedTime}
                  min={
                    selectedDate && isSameDay(selectedDate, new Date())
                      ? format(new Date(), "HH:mm")
                      : undefined
                  }
                  onChange={(e) => setSelectedTime(e.target.value)}
                />
              </div>
            </div>
            {errors.expires && (
              <p className="text-xs text-red-600">{errors.expires}</p>
            )}
          </div>
        )}
      </div>

      {errors.submit && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-100">
          <p className="text-sm text-red-600">{errors.submit}</p>
        </div>
      )}
    </div>
  );

  if (!shouldRender) return null;

  // Desktop: Custom Modal
  if (isDesktop) {
    return (
      <div
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center p-4 min-h-screen",
          !isVisible && "pointer-events-none",
        )}
      >
        <div
          className={cn(
            "fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-200 ease-in-out",
            isVisible ? "opacity-100" : "opacity-0",
          )}
          onClick={handleClose}
        />
        <div
          className={cn(
            "relative z-10 w-full max-w-lg bg-white rounded-xl shadow-2xl transition-all duration-200 ease-out transform",
            isVisible
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-95 translate-y-4",
          )}
          onTransitionEnd={onAnimationEnd}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gray-50 border border-[#E5E7EB] flex items-center justify-center shadow-sm">
                <Globe className="w-4 h-4 text-gray-900" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  {isEditMode ? "Edit link" : "Create new link"}
                </h2>
                <p className="text-xs text-gray-500">
                  {isEditMode
                    ? "Update destination or expiry"
                    : "Shorten a URL to share"}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {formContent}
          </form>

          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50/50 border-t border-[#E5E7EB] rounded-b-xl">
            <Button
              variant="outline"
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 border-[#E5E7EB]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              loading={createLink.isPending || updateLink.isPending}
              className="bg-black hover:bg-gray-800 text-white shadow-md"
            >
              {isEditMode ? "Save changes" : "Create link"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Mobile: Drawer
  return (
    <Drawer
      open={open}
      onOpenChange={(o) => {
        if (!o) handleClose();
      }}
    >
      <DrawerContent>
        <DrawerHeader className="text-left border-b border-gray-100 pb-4">
          <DrawerTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center shadow-sm">
              <Globe className="w-4 h-4 text-gray-900" />
            </div>
            {isEditMode ? "Edit link" : "Create new link"}
          </DrawerTitle>
          <div className="text-xs text-gray-500 pl-10">
            {isEditMode
              ? "Update destination or expiry"
              : "Shorten a URL to share"}
          </div>
        </DrawerHeader>
        <div className="p-4 overflow-y-auto max-h-[70vh]">
          <form onSubmit={handleSubmit}>
            {formContent}

            <div className="mt-6 flex flex-col gap-3">
              <Button
                onClick={handleSubmit}
                loading={createLink.isPending || updateLink.isPending}
                className="w-full bg-black hover:bg-gray-800 text-white shadow-md py-6"
              >
                {isEditMode ? "Save changes" : "Create link"}
              </Button>
              <Button
                variant="outline"
                onClick={handleClose}
                className="w-full text-gray-500 hover:text-gray-700 border-gray-200 py-6"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
