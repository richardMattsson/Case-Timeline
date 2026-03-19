import { useState } from "react";
import useTimelineData from "../hooks/useTimelineData";
import { useAppSelector } from "../hooks/storeHooks";
import TimelineAxis from "./TimelineAxis";
import TimelineGroup from "./TimelineGroup";

const Timeline = () => {
  const events = useAppSelector((state) => state.events.items);
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>(
    {},
  );
  const [orientation, setOrientation] = useState<"vertical" | "horizontal">(
    "vertical",
  );

  const height = 500;
  const width = 900;
  const timelineX = 80;
  const timelineY = height - 60;
  const stackOffset = 10;
  const stackLimit = 2;
  const axisLength = orientation === "vertical" ? height : width;
  const { timeScale, groupedEvents } = useTimelineData(events, axisLength);

  return (
    <div
      style={{
        position: "relative",
        height: `${height}px`,
        width: orientation === "horizontal" ? `${width}px` : "100%",
        border: "4px solid #8a1414",
      }}
    >
      <button
        type="button"
        onClick={() =>
          setOrientation((prev) =>
            prev === "vertical" ? "horizontal" : "vertical",
          )
        }
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          zIndex: 1,
          background: "#ffffff",
          border: "1px solid #bbb",
          borderRadius: "6px",
          padding: "6px 10px",
          cursor: "pointer",
        }}
      >
        {orientation === "vertical" ? "Horizontal" : "Vertical"}
      </button>
      <TimelineAxis
        orientation={orientation}
        axisLength={axisLength}
        axisOffset={orientation === "vertical" ? timelineX : timelineY}
        timeScale={timeScale}
      />
      {groupedEvents.map((group) => {
        const position = timeScale(group.date);
        const isExpanded = Boolean(expandedDates[group.dateKey]);
        return (
          <TimelineGroup
            key={group.dateKey}
            group={group}
            orientation={orientation}
            position={position}
            axisOffset={orientation === "vertical" ? timelineX : timelineY}
            stackOffset={stackOffset}
            stackLimit={stackLimit}
            isExpanded={isExpanded}
            onToggle={() =>
              setExpandedDates((prev) => ({
                ...prev,
                [group.dateKey]: !isExpanded,
              }))
            }
            onEventClick={(event) => console.log(event.title)}
          />
        );
      })}
    </div>
  );
};

export default Timeline;
