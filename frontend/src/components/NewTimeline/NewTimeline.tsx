import { scaleTime } from "@visx/scale";
import { extent } from "d3-array";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { timeFormat } from "d3-time-format";
import { useTooltip, useTooltipInPortal, defaultStyles } from "@visx/tooltip";
import { localPoint } from "@visx/event";
import { useEffect, useRef, useState } from "react";
import { Group } from "@visx/group";
import { useAppSelector } from "../../hooks/storeHooks";
import type { Event } from "../../features/events/eventsSlice";
import { Circle, Line } from "@visx/shape";
import SelectedEvent from "./SelectedEvent";
import { Text } from "@visx/text";

// Canvas dimensions
const MARGIN = { top: 40, right: 40, bottom: 40, left: 40 };
const MS_PER_DAY = 1000 * 60 * 60 * 24;

interface TimelineProps {
  width: number;
  orientation: "horizontal" | "vertical";
}

const formatDate = timeFormat("%b %d, %Y");

const categoryColor: Record<Event["category"], string> = {
  milestone: "#4caf50",
  release: "#1976d2",
  incident: "#e53935",
};

export default function NewTimeline({ width, orientation }: TimelineProps) {
  const events = useAppSelector((state) => state.events.items);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const divContainerRef = useRef<HTMLDivElement>(null);
  const [pixelsPerDay, setPixelsPerDay] = useState(10);

  useEffect(() => {
    const el = divContainerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      setPixelsPerDay((prev) =>
        Math.max(0.5, Math.min(50, prev * (e.deltaY < 0 ? 1.1 : 0.9))),
      );
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, []);

  const dates = events
    .map((e) => new Date(e.date))
    .filter((d) => !isNaN(d.getTime()));

  const [minDate, maxDate] = extent(dates);

  const totalDays =
    minDate && maxDate
      ? (maxDate.getTime() - minDate.getTime()) / MS_PER_DAY
      : 0;

  const HEIGHT =
    orientation === "vertical" ? Math.max(600, totalDays * pixelsPerDay) : 600;
  const WIDTH =
    orientation === "horizontal"
      ? Math.max(width, totalDays * pixelsPerDay)
      : width;

  const innerHeight = HEIGHT - MARGIN.top - MARGIN.bottom;
  const innerWidth = WIDTH - MARGIN.left - MARGIN.right;
  const centerY = innerHeight;

  const domain = minDate ? [minDate, maxDate] : [new Date(), new Date()];
  const horizontalScale = scaleTime({ domain, range: [30, innerWidth] });
  const verticalScale = scaleTime({ domain, range: [0, innerHeight] });
  const timeScale =
    orientation === "horizontal" ? horizontalScale : verticalScale;

  const numTicks =
    orientation === "vertical"
      ? Math.max(5, Math.floor(innerHeight / 110))
      : Math.max(5, Math.floor(innerWidth / 110));
  const tickValues = timeScale.ticks(numTicks).filter((_, i) => i % 2 === 0);

  const {
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
  } = useTooltip<Event>();

  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    scroll: true,
    detectBounds: true,
  });

  return (
    <div>
      <div
        ref={divContainerRef}
        id="timeline-container-2"
        style={{
          position: "relative",
          height: HEIGHT,
          width: WIDTH,
          overflowX: orientation === "horizontal" ? "auto" : undefined,
          overflowY: "hidden",
        }}
      >
        <svg width={WIDTH} height={HEIGHT} ref={containerRef}>
          <Group left={MARGIN.left} top={MARGIN.top}>
            {/* Layer 1: Text */}
            {events.map((e, i) => {
              const isRight = i % 2 === 0;
              return (
                <Group
                  key={`connector-${e.id}`}
                  left={
                    orientation === "vertical"
                      ? 40
                      : timeScale(new Date(e.date))
                  }
                  top={
                    orientation === "vertical"
                      ? timeScale(new Date(e.date)) || 0
                      : centerY
                  }
                >
                  <Text
                    x={orientation === "vertical" ? 120 : 0}
                    y={orientation === "vertical" ? 0 : isRight ? -105 : -85}
                    dominantBaseline="middle"
                    textAnchor={orientation === "vertical" ? "start" : "middle"}
                    fontSize={11}
                    fontFamily="monospace"
                    fill="#9ca3af"
                  >
                    {e.title}
                  </Text>
                  {orientation === "vertical" ? (
                    <Line
                      from={{ x: 55, y: 0 }}
                      to={{ x: 115, y: 0 }}
                      stroke="#cccccc6a"
                      strokeWidth={1}
                    />
                  ) : (
                    <Line
                      from={{ x: 0, y: -8 }}
                      to={{ x: 0, y: isRight ? -100 : -80 }}
                      stroke="#ccc"
                      strokeWidth={1}
                    />
                  )}
                </Group>
              );
            })}

            {/* Layer 2: Axis */}
            {orientation === "vertical" ? (
              <>
                <Line
                  from={{ x: 80, y: 0 }}
                  to={{ x: 80, y: innerHeight }}
                  stroke="#ccc"
                  strokeWidth={2}
                />

                <AxisLeft
                  left={80}
                  scale={timeScale}
                  tickFormat={(date) => formatDate(date as Date)}
                  tickValues={tickValues}
                  tickLength={10}
                  stroke="#ccc"
                  tickStroke="#ccc"
                  tickLabelProps={() => ({
                    fill: "#fff",
                    fontSize: 11,
                    fontWeight: 600,
                    textAnchor: "end",
                    fontFamily: "monospace",
                    dx: "-0.5em",
                    dy: "0.3em",
                  })}
                />
              </>
            ) : (
              <>
                <Line
                  from={{ x: 0, y: centerY }}
                  to={{ x: innerWidth, y: centerY }}
                  stroke="#ccc"
                  strokeWidth={2}
                />
                <AxisBottom
                  top={centerY}
                  scale={timeScale}
                  tickFormat={(date) => formatDate(date as Date)}
                  tickValues={tickValues}
                  tickLength={10}
                  stroke="#ccc"
                  tickStroke="#ccc"
                  tickLabelProps={() => ({
                    fill: "#666",
                    fontSize: 11,
                    fontWeight: 600,
                    textAnchor: "end",
                    fontFamily: "monospace",
                    dx: "5.5em",
                    dy: "0.3em",
                  })}
                />
              </>
            )}

            {/* Layer 3: circles */}
            {events.map((e) => {
              // const isRight = i % 2 === 0;
              return (
                <Group
                  key={`dot-${e.id}`}
                  left={
                    orientation === "vertical"
                      ? 80
                      : timeScale(new Date(e.date))
                  }
                  top={
                    orientation === "vertical"
                      ? timeScale(new Date(e.date)) || 0
                      : centerY
                  }
                >
                  <Circle
                    cx={0}
                    cy={0}
                    r={selectedEvent?.id === e.id ? 10 : 7}
                    fill={categoryColor[e.category]}
                    stroke={selectedEvent?.id === e.id ? "black" : "none"}
                    strokeWidth={1}
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      setSelectedEvent((prev) => (prev?.id === e.id ? null : e))
                    }
                    onMouseEnter={(event) => {
                      const point = localPoint(event);
                      showTooltip({
                        tooltipLeft: point?.x ?? 0,
                        tooltipTop: point?.y ?? 0,
                        tooltipData: e,
                      });
                    }}
                    onMouseLeave={hideTooltip}
                  />
                </Group>
              );
            })}
          </Group>
        </svg>

        {selectedEvent && (
          <SelectedEvent
            event={selectedEvent}
            handleClose={() => setSelectedEvent(null)}
          />
        )}

        {tooltipOpen && tooltipData && (
          <TooltipInPortal
            top={tooltipTop}
            left={tooltipLeft}
            style={{
              ...defaultStyles,
              border: `1px solid ${categoryColor[tooltipData.category]}`,
              color: "#222",
              borderRadius: 8,
              fontSize: 13,
              fontFamily: "monospace",
              boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
              borderLeft: `4px solid ${categoryColor[tooltipData.category]}`,
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 4 }}>
              {tooltipData.title}
            </div>
            <div style={{ opacity: 0.8, marginBottom: 4 }}>
              {new Date(tooltipData.date).toLocaleDateString()}
            </div>
            {/* <div style={{ opacity: 0.9 }}>{tooltipData.description}</div> */}
          </TooltipInPortal>
        )}
      </div>
    </div>
  );
}
