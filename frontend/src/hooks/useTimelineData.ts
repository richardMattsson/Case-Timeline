import { useMemo } from "react";
import { scaleTime } from "@visx/scale";
import { extent } from "d3-array";
import type { Event } from "../features/events/eventsSlice";

export interface TimelineGroup {
  dateKey: string;
  date: Date;
  events: Event[];
}

const useTimelineData = (events: Event[], axisLength: number) => {
  const sortedEvents = useMemo(
    () =>
      [...events].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      ),
    [events],
  );

  const timeScale = useMemo(() => {
    if (sortedEvents.length === 0) {
      return scaleTime({
        domain: [new Date(), new Date()],
        range: [0, axisLength],
      });
    }

    const [minDate, maxDate] = extent(
      sortedEvents,
      (event) => new Date(event.date),
    ) as [Date, Date];

    return scaleTime({
      domain: [minDate, maxDate],
      range: [0, axisLength],
    });
  }, [sortedEvents, axisLength]);

  const groupedEvents = useMemo<TimelineGroup[]>(() => {
    const groups = new Map<string, TimelineGroup>();

    sortedEvents.forEach((event) => {
      const date = new Date(event.date);
      const dateKey = date.toISOString().slice(0, 10);
      const existing = groups.get(dateKey);

      if (existing) {
        existing.events.push(event);
      } else {
        groups.set(dateKey, { dateKey, date, events: [event] });
      }
    });

    return Array.from(groups.values()).sort(
      (a, b) => a.date.getTime() - b.date.getTime(),
    );
  }, [sortedEvents]);

  return { timeScale, groupedEvents };
};

export default useTimelineData;
