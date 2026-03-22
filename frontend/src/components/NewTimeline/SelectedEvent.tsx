import type { Event } from "../../features/events/eventsSlice";
const categoryColor: Record<Event["category"], string> = {
  milestone: "rgb(76, 175, 80)",
  release: "rgb(37, 64, 217)",
  incident: "rgb(185, 41, 41)",
};

type Props = {
  event: Event;
  handleClose: React.Dispatch<React.SetStateAction<Event | null>>;
};

function SelectedEvent({ event, handleClose }: Props) {
  return (
    <div
      style={{
        position: "fixed",
        top: 24,
        left: 24,
        zIndex: 100,
        padding: "20px 24px",
        background: "#fff",
        border: `2px solid ${categoryColor[event.category]}`,
        borderRadius: 12,
        fontFamily: "monospace",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        maxWidth: 300,
        minWidth: 200,
      }}
    >
      <div
        style={{
          display: "inline-block",
          fontSize: 10,
          letterSpacing: 2,
          textTransform: "uppercase",
          padding: "3px 10px",
          borderRadius: 20,
          background: categoryColor[event.category],
          color: "#fff",
          marginBottom: 12,
        }}
      >
        {event.title}
      </div>

      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: "#1a1a2e",
          marginBottom: 6,
        }}
      >
        {event.title}
      </div>

      <div style={{ fontSize: 12, color: "#888", marginBottom: 12 }}>
        {new Date(event.date).toLocaleDateString()}
      </div>

      <div style={{ fontSize: 14, color: "#444", lineHeight: 1.6 }}>
        {event.description}
      </div>

      <button
        onClick={() => handleClose(null)}
        style={{
          marginTop: 16,
          padding: "6px 14px",
          border: `1px solid ${categoryColor[event.category]}`,
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
  );
}

export default SelectedEvent;
