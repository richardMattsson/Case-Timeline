import { scaleTime } from "@visx/scale";
import { extent } from "d3-array";
import { timeWeek } from "d3-time";
import type { Event } from "../../features/events/eventsSlice";
import type { TransformMatrix } from "@visx/zoom/lib/types";

export const MARGIN_HORIZONTAL = { top: 0, right: 20, bottom: 80, left: 20 };
export const MARGIN_VERTICAL = { top: 70, right: 0, bottom: 20, left: 140 };
export const DEFAULT_TRANSFORM: TransformMatrix = {
  scaleX: 1,
  scaleY: 1,
  translateX: 0,
  translateY: 0,
  skewX: 0,
  skewY: 0,
};

export function getTimelineScale(
  events: Event[],
  innerWidth: number,
  innerHeight: number,
  isVertical: boolean,
) {
  const [minDate, maxDate] = extent(events, (event) => new Date(event.date));

  let domain: [Date, Date];
  if (!minDate) {
    domain = [new Date(), new Date()];
  } else if (minDate.getTime() === maxDate.getTime()) {
    domain = [timeWeek.offset(minDate, -1), timeWeek.offset(minDate, 1)];
  } else {
    domain = [minDate, maxDate];
  }

  const timeScale = scaleTime({
    domain,
    range: [0, isVertical ? innerHeight : innerWidth],
  });

  return timeScale;
}
