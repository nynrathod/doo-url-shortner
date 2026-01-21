import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isBefore,
  isSameDay,
  isToday,
  startOfMonth,
  startOfDay,
  startOfToday,
  subMonths,
} from "date-fns";
import { cn } from "@/lib/utils";

interface CalendarProps {
  className?: string;
  value?: Date;
  onChange?: (date: Date) => void;
  minDate?: Date;
}

export function Calendar({
  className,
  value,
  onChange,
  minDate,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(
    format(startOfToday(), "MMM-yyyy"),
  );
  const firstDayCurrentMonth = startOfMonth(new Date(currentMonth));

  const days = eachDayOfInterval({
    start: firstDayCurrentMonth,
    end: endOfMonth(firstDayCurrentMonth),
  });

  const previousMonth = () => {
    const firstDayNextMonth = subMonths(firstDayCurrentMonth, 1);
    setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"));
  };

  const nextMonth = () => {
    const firstDayNextMonth = addMonths(firstDayCurrentMonth, 1);
    setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"));
  };

  const colStartClasses = [
    "",
    "col-start-2",
    "col-start-3",
    "col-start-4",
    "col-start-5",
    "col-start-6",
    "col-start-7",
  ];

  return (
    <div className={cn("p-3", className)}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900">
          {format(firstDayCurrentMonth, "MMMM yyyy")}
        </h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={previousMonth}
            className="-my-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">Previous month</span>
            <ChevronLeft className="w-5 h-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="-my-1.5 -mr-1.5 ml-2 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">Next month</span>
            <ChevronRight className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 text-xs leading-6 text-center text-gray-500">
        <div>S</div>
        <div>M</div>
        <div>T</div>
        <div>W</div>
        <div>T</div>
        <div>F</div>
        <div>S</div>
      </div>
      <div className="grid grid-cols-7 mt-2 text-sm">
        {days.map((day, dayIdx) =>
          (() => {
            const isDisabled = !!minDate && isBefore(day, startOfDay(minDate));
            return (
              <div
                key={day.toString()}
                className={cn(
                  dayIdx === 0 && colStartClasses[getDay(day)],
                  "py-1.5",
                )}
              >
                <button
                  type="button"
                  disabled={isDisabled}
                  onClick={() => {
                    if (isDisabled) return;
                    onChange?.(day);
                  }}
                  className={cn(
                    isSameDay(day, value || new Date(0)) && "text-white",
                    !isSameDay(day, value || new Date(0)) &&
                      isToday(day) &&
                      "text-blue-600 font-semibold",
                    !isSameDay(day, value || new Date(0)) &&
                      !isToday(day) &&
                      "text-gray-900",
                    isSameDay(day, value || new Date(0)) && "bg-black",
                    !isSameDay(day, value || new Date(0)) &&
                      "hover:bg-gray-100",
                    (isSameDay(day, value || new Date(0)) || isToday(day)) &&
                      "font-semibold",
                    isDisabled &&
                      "opacity-40 cursor-not-allowed hover:bg-transparent",
                    "mx-auto flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                  )}
                >
                  <time dateTime={format(day, "yyyy-MM-dd")}>
                    {format(day, "d")}
                  </time>
                </button>
              </div>
            );
          })(),
        )}
      </div>
    </div>
  );
}
