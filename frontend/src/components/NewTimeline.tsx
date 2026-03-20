import { scaleTime } from "@visx/scale";
import { extent } from "d3-array";
import { AxisLeft } from "@visx/axis";
import { timeFormat } from "d3-time-format";
import { TooltipWithBounds, useTooltip } from "@visx/tooltip";
import { useState } from "react";
import { Group } from "@visx/group";
import { useAppSelector } from "../hooks/storeHooks";
import type { Event } from "../features/events/eventsSlice";

// Canvas dimensions
const MIN_EVENT_SPACING = 80; // minimum pixels between events
const MARGIN = { top: 40, right: 40, bottom: 40, left: 40 };

interface TimelineProps {
  width: number;
}

// interface TimelineEvent {
//   id: string;
//   date: Date;
//   label: string;
//   description: string;
//   category: "milestone" | "release" | "incident";
// }

const formatDate = timeFormat("%b %Y"); // → "Jan 2024", "Oct 2024"

// const categoryColor: Record<TimelineEvent["category"], string> = {
//   milestone: "#4caf50",
//   release: "#1976d2",
//   incident: "#e53935",
// };

export default function NewTimeline({ width }: TimelineProps) {
  const events = useAppSelector((state) => state.events.items);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const HEIGHT = Math.max(
    600, // minimum height
    events.length * MIN_EVENT_SPACING,
  );
  const innerWidth = width - MARGIN.left - MARGIN.right; // ✅ inside
  const centerX = innerWidth / 2;
  const innerHeight = HEIGHT - MARGIN.top - MARGIN.bottom;
  const dates = events
    .map((e) => new Date(e.date))
    .filter((d) => !isNaN(d.getTime()));

  // 1️⃣ Compute the date range from your data
  const [minDate, maxDate] = extent(dates);
  // timeScale now uses the dynamic innerWidth
  const timeScale = scaleTime({
    domain: minDate ? [minDate, maxDate] : [new Date(), new Date()], // fallback to "now" if no events
    range: [0, innerHeight],
  });

  const {
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
  } = useTooltip<Event>();

  return (
    <div style={{ position: "relative", height: HEIGHT }}>
      <svg width={width} height={HEIGHT}>
        <Group left={MARGIN.left} top={MARGIN.top}>
          {/* We'll add the axis and markers here next */}

          {/* Baseline */}
          <line
            x1={centerX}
            x2={centerX}
            y1={0}
            y2={innerHeight}
            stroke="#ccc"
            strokeWidth={2}
          />

          <AxisLeft
            left={centerX} // A left pixel offset applied to the entire axis.
            scale={timeScale} // The scale used to position ticks and labels.
            tickFormat={(date) => formatDate(date as Date)} // Format function for tick labels
            numTicks={5} // Approximate number of ticks to display
            tickLength={10} // Length of the tick lines
            stroke="#ccc" // Color of the axis line
            tickStroke="#ccc" // Color of the tick lines
            tickLabelProps={() => ({
              fill: "#666",
              fontSize: 11,
              textAnchor: "end",
              fontFamily: "monospace",
              dx: "-0.5em",
              dy: "0.3em",
            })}
          />
          {events.map((e, i) => {
            const isRight = i % 2 === 0; // even index → right, odd → left
            return (
              <Group
                key={e.id}
                left={centerX}
                top={timeScale(new Date(e.date)) || 0}
              >
                <text
                  x={isRight ? 85 : -85}
                  y={0}
                  dominantBaseline="middle"
                  textAnchor={isRight ? "start" : "end"}
                  fontSize={11}
                  fontFamily="monospace"
                  fill="#333"
                >
                  {e.title}
                </text>

                {/* Connector line from dot to label */}
                <line
                  x1={isRight ? 8 : -8}
                  x2={isRight ? 80 : -80}
                  y1={0}
                  y2={0}
                  stroke="#ccc"
                  strokeWidth={1}
                />

                {/* Dot */}
                <circle
                  cx={0}
                  cy={0}
                  r={selectedEvent?.id === e.id ? 10 : 7}
                  fill={"blue"}
                  stroke={selectedEvent?.id === e.id ? "#1a1a2e" : "none"}
                  strokeWidth={2}
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    setSelectedEvent((prev) => (prev?.id === e.id ? null : e))
                  }
                  onMouseEnter={(event) => {
                    const { clientX, clientY } = event;
                    showTooltip({
                      tooltipLeft: isRight ? clientX - 190 : clientX + 20,
                      tooltipTop: clientY - 40,
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
            border: `2px solid blue`,
            borderRadius: 12,
            fontFamily: "monospace",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            maxWidth: 300,
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
              background: "blue",
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
              border: `1px solid blue`,
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
            border: `1px solid blue`,
            borderRadius: 8,
            fontSize: 13,
            fontFamily: "monospace",
            boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
            borderLeft: `4px solid blue`,
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
  );
}
