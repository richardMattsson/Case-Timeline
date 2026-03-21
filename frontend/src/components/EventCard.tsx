import { useState } from "react";
import { updateEvent, type Event } from "../features/events/eventsSlice";
import { useAppDispatch } from "../hooks/storeHooks";

interface EventCardProps {
  event: Event;
  onClick?: (event: Event) => void;
}

const EventCard = ({ event }: EventCardProps) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Omit<Event, "id">>({
    date: new Date().toISOString(),
    title: "",
    description: "",
    category: "milestone",
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
            type="date"
            value={form.date || ""}
            onChange={(e) => {
              e.stopPropagation();
              setForm({ ...form, date: e.target.value });
            }}
          />
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <label htmlFor="category">Category:</label>
          <select
            name="category"
            onChange={(e) =>
              setForm({
                ...form,
                category: e.target.value as Event["category"],
              })
            }
          >
            <option value={"milestone"}>milestone</option>
            <option value={"release"}>release</option>
            <option value={"incident"}>incident</option>
          </select>

          <button
            onClick={(e) => {
              e.stopPropagation();
              dispatch(
                updateEvent({
                  ...form,
                  id: event.id,
                  date: form.date,
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
              setForm({
                date: event.date.slice(0, 10),
                title: event.title,
                description: event.description,
                category: event.category,
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
