import { useState } from "react";
import { updateEvent, type Event } from "../features/events/eventsSlice";
import { useAppDispatch } from "../hooks/storeHooks";

interface EventCardProps {
  event: Event;
  onClick?: (event: Event) => void;
}

const EventCard = ({ event }: EventCardProps) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
  });
  const dispatch = useAppDispatch();
  return (
    <div
      //   onClick={() => onClick?.(event)}
      style={{
        background: "#a88e8e",
        border: "1px solid #443737",
        padding: "12px",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      {editingId === event.id ? (
        <>
          <input
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
          <input
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
          <input
            type="date"
            value={formData.date || ""}
            onChange={(e) => {
              e.stopPropagation();
              setFormData({ ...formData, date: e.target.value });
            }}
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              dispatch(
                updateEvent({
                  ...formData,
                  id: event.id,
                  date: new Date(formData.date).toISOString(),
                }),
              );
              setEditingId(null);
            }}
          >
            Save
          </button>

          <button onClick={() => setEditingId(null)}>Cancel</button>
        </>
      ) : (
        <>
          <h3>{event.title}</h3>
          <p>{event.description}</p>
          <small>{new Date(event.date).toLocaleDateString()}</small>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditingId(event.id);
              setFormData({
                title: event.title,
                description: event.description,
                date: event.date.slice(0, 10),
              });
            }}
          >
            Edit
          </button>
        </>
      )}
    </div>
  );
};

export default EventCard;
