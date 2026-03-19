import type { Event } from "../features/events/eventsSlice";
import type { TimelineGroup as TimelineGroupType } from "../hooks/useTimelineData";
import EventCard from "./EventCard";

interface TimelineGroupProps {
  group: TimelineGroupType;
  orientation: "vertical" | "horizontal";
  position: number;
  axisOffset: number;
  stackOffset: number;
  stackLimit: number;
  isExpanded: boolean;
  onToggle: () => void;
  onEventClick?: (event: Event) => void;
}

const TimelineGroup = ({
  group,
  orientation,
  position,
  axisOffset,
  stackOffset,
  stackLimit,
  isExpanded,
  onToggle,
  onEventClick,
}: TimelineGroupProps) => {
  const visibleEvents = isExpanded
    ? group.events
    : group.events.slice(0, stackLimit);
  const hiddenCount = group.events.length - visibleEvents.length;
  const showToggle = group.events.length > stackLimit;
  const firstEvent = group.events[0];
  const secondEvent = group.events[1];
  const extraEvents = isExpanded ? group.events.slice(2) : [];
  const dotSize = 16;
  const dotRadius = dotSize / 2;

  if (orientation === "horizontal") {
    return (
      <div
        style={{
          position: "absolute",
          top: 0,
          left: position,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: `${-dotRadius}px`,
            top: `${axisOffset - dotRadius}px`,
            width: `${dotSize}px`,
            height: `${dotSize}px`,
            borderRadius: "50%",
            background: "#1976d2",
          }}
          title={new Date(group.date).toLocaleDateString()}
        />
        <div
          style={{
            position: "absolute",
            left: "-1px",
            top: `${axisOffset - 12}px`,
            width: "2px",
            height: "12px",
            background: "#aa9494",
            zIndex: -1,
          }}
        />

        <div
          style={{
            position: "absolute",
            left: "20px",
            top: `${axisOffset - 12}px`,
            transform: "translateY(-100%)",
            display: "flex",
            flexDirection: "column",
            gap: `${stackOffset}px`,
          }}
        >
          {visibleEvents.map((event) => (
            <EventCard key={event.id} event={event} onClick={onEventClick} />
          ))}
          {showToggle && (
            <button
              type="button"
              onClick={onToggle}
              style={{
                marginTop: "8px",
                alignSelf: "flex-start",
                background: "transparent",
                border: "none",
                color: "#1b4f9c",
                cursor: "pointer",
                padding: 0,
              }}
            >
              {isExpanded ? "Show less" : `+${hiddenCount} more`}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "absolute",
        top: position,
        left: 0,
      }}
    >
      {/* dot */}
      <div
        style={{
          position: "absolute",
          left: `${axisOffset - dotRadius}px`,

          width: `${dotSize}px`,
          height: `${dotSize}px`,
          borderRadius: "50%",
          background: "#1976d2",
        }}
        title={new Date(group.date).toLocaleDateString()}
      />
      <div
        style={{
          position: "absolute",
          left: `${axisOffset}px`,
          top: "6px",
          width: `${axisOffset}px`,
          height: "2px",
          background: "#aa9494",
          zIndex: -1,
        }}
      />

      {/* cards */}
      <div style={{ marginLeft: `${axisOffset + 40}px` }}>
        <div
          style={{
            display: "flex",
            gap: `${stackOffset}px`,
            alignItems: "flex-start",
          }}
        >
          {firstEvent && (
            <EventCard event={firstEvent} onClick={onEventClick} />
          )}
          {secondEvent && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <EventCard event={secondEvent} onClick={onEventClick} />
              {extraEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onClick={onEventClick}
                />
              ))}
              {showToggle && (
                <button
                  type="button"
                  onClick={onToggle}
                  style={{
                    marginTop: "8px",
                    alignSelf: "flex-start",
                    background: "transparent",
                    border: "none",
                    color: "#1b4f9c",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  {isExpanded ? "Show less" : `+${hiddenCount} more`}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimelineGroup;
