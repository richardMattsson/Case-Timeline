import { scaleTime } from "@visx/scale";
import { extent } from "d3-array";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { timeFormat } from "d3-time-format";
import { TooltipWithBounds, useTooltip } from "@visx/tooltip";
import { useEffect, useRef, useState } from "react";
import { Group } from "@visx/group";
import { useAppSelector } from "../../hooks/storeHooks";
import type { Event } from "../../features/events/eventsSlice";
import { Line } from "@visx/shape";

// Canvas dimensions
const MARGIN = { top: 40, right: 40, bottom: 40, left: 40 };
const MS_PER_DAY = 1000 * 60 * 60 * 24;

interface TimelineProps {
  width: number;
}

const formatDate = timeFormat("%b %d, %Y");

const categoryColor: Record<Event["category"], string> = {
  milestone: "#4caf50",
  release: "#1976d2",
  incident: "#e53935",
};

export default function NewTimeline({ width }: TimelineProps) {
  const events = useAppSelector((state) => state.events.items);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [orientation, setOrientation] = useState<"horizontal" | "vertical">(
    "vertical",
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const [pixelsPerDay, setPixelsPerDay] = useState(10);

  useEffect(() => {
    const el = containerRef.current;
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
  const centerX = innerWidth / 2;
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

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", width: "100px" }}>
        <button onClick={() => setOrientation("horizontal")}>Horizontal</button>
        <button onClick={() => setOrientation("vertical")}>Vertical</button>
      </div>
      <div
        ref={containerRef}
        id="timeline-container-2"
        style={{
          position: "relative",
          height: HEIGHT,
          width: WIDTH,
          overflowX: orientation === "horizontal" ? "auto" : undefined,
          overflowY: "hidden",
        }}
      >
        <svg
          width={WIDTH}
          height={HEIGHT}
          // style={{ border: "1px solid black" }}
        >
          <Group left={MARGIN.left} top={MARGIN.top}>
            {events.map((e, i) => {
              const isRight = i % 2 === 0;
              return (
                <Group
                  key={`connector-${e.id}`}
                  left={
                    orientation === "vertical"
                      ? centerX
                      : timeScale(new Date(e.date))
                  }
                  top={
                    orientation === "vertical"
                      ? timeScale(new Date(e.date)) || 0
                      : centerY
                  }
                >
                  <text
                    x={orientation === "vertical" ? (isRight ? 100 : -100) : 0}
                    y={orientation === "vertical" ? 0 : isRight ? -105 : -85}
                    dominantBaseline="middle"
                    textAnchor={
                      orientation === "vertical"
                        ? isRight
                          ? "start"
                          : "end"
                        : "middle"
                    }
                    fontSize={11}
                    fontFamily="monospace"
                    fill="#9ca3af"
                  >
                    {e.title}
                  </text>
                  {orientation === "vertical" ? (
                    <Line
                      from={{ x: isRight ? 8 : -8, y: 0 }}
                      to={{ x: isRight ? 95 : -95, y: 0 }}
                      stroke="#ccc"
                      strokeWidth={1}
                      strokeDasharray="4 3"
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

            {orientation === "vertical" ? (
              <>
                <Line
                  from={{ x: centerX, y: 0 }}
                  to={{ x: centerX, y: innerHeight }}
                  stroke="#ccc"
                  strokeWidth={2}
                />

                <AxisLeft
                  left={centerX} // A left pixel offset applied to the entire axis.
                  scale={timeScale} // The scale used to position ticks and labels.
                  tickFormat={(date) => formatDate(date as Date)} // Format function for tick labels
                  // numTicks={numTicks} // Approximate number of ticks to display
                  tickValues={tickValues}
                  tickLength={10} // Length of the tick lines
                  stroke="#ccc" // Color of the axis line
                  tickStroke="#ccc" // Color of the tick lines
                  tickLabelProps={() => ({
                    fill: "#666",
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
                  tickFormat={(date) => formatDate(date as Date)} // Format function for tick labels
                  // numTicks={5} // Approximate number of ticks to display
                  tickValues={tickValues}
                  tickLength={10} // Length of the tick lines
                  stroke="#ccc" // Color of the axis line
                  tickStroke="#ccc" // Color of the tick lines
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

            {/* Layer 3: circles (on top of everything) */}
            {events.map((e, i) => {
              const isRight = i % 2 === 0;
              return (
                <Group
                  key={`dot-${e.id}`}
                  left={
                    orientation === "vertical"
                      ? centerX
                      : timeScale(new Date(e.date))
                  }
                  top={
                    orientation === "vertical"
                      ? timeScale(new Date(e.date)) || 0
                      : centerY
                  }
                >
                  <circle
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
                      const { clientX, clientY } = event;
                      showTooltip({
                        tooltipLeft:
                          orientation === "vertical"
                            ? isRight
                              ? clientX - 190
                              : clientX + 20
                            : clientX - 40,

                        tooltipTop:
                          orientation === "vertical"
                            ? clientY - 40
                            : clientY - 100,
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
          <div
            style={{
              position: "fixed",
              top: 24,
              left: 24,
              zIndex: 100,
              padding: "20px 24px",
              background: "#fff",
              border: `2px solid ${categoryColor[selectedEvent.category]}`,
              borderRadius: 12,
              fontFamily: "monospace",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              maxWidth: 300,
              minWidth: 200,
            }}
          >
            {/* Category badge */}
            <div
              style={{
                display: "inline-block",
                fontSize: 10,
                letterSpacing: 2,
                textTransform: "uppercase",
                padding: "3px 10px",
                borderRadius: 20,
                background: categoryColor[selectedEvent.category],
                color: "#fff",
                marginBottom: 12,
              }}
            >
              {selectedEvent.title}
            </div>

            {/* Title */}
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#1a1a2e",
                marginBottom: 6,
              }}
            >
              {selectedEvent.title}
            </div>

            {/* Date */}
            <div style={{ fontSize: 12, color: "#888", marginBottom: 12 }}>
              {new Date(selectedEvent.date).toLocaleDateString()}
            </div>

            {/* Description */}
            <div style={{ fontSize: 14, color: "#444", lineHeight: 1.6 }}>
              {selectedEvent.description}
            </div>

            {/* Close button */}
            <button
              onClick={() => setSelectedEvent(null)}
              style={{
                marginTop: 16,
                padding: "6px 14px",
                border: `1px solid ${categoryColor[selectedEvent.category]}`,
                borderRadius: 6,
                background: "transparent",
                cursor: "pointer",
                fontFamily: "monospace",
                fontSize: 12,
                color: "#111",
              }}
            >
              close ✕
            </button>
          </div>
        )}

        {tooltipOpen && tooltipData && (
          <TooltipWithBounds
            left={tooltipLeft}
            top={tooltipTop}
            style={{
              background: "#fff",
              color: "#111",
              maxWidth: 300,
              padding: "10px 14px",
              position: "fixed",
              border: `1px solid ${categoryColor[tooltipData.category]}`,
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
          </TooltipWithBounds>
        )}
      </div>
    </div>
  );
}
