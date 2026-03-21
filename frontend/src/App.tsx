import { ParentSize } from "@visx/responsive";
import NewTimeline from "./components/NewTimeline/NewTimeline";
import { useAppDispatch, useAppSelector } from "./hooks/storeHooks";
import { useEffect, useState } from "react";
import {
  createEvent,
  deleteEvent,
  fetchEvents,
} from "./features/events/eventsSlice";
import type { Event } from "./features/events/eventsSlice";

function App() {
  const dispatch = useAppDispatch();
  const events = useAppSelector((state) => state.events.items);

  const [form, setForm] = useState<Omit<Event, "id">>({
    date: new Date().toISOString(),
    title: "",
    description: "",
    category: "milestone",
  });

  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  const handleCreate = () => {
    dispatch(
      createEvent({
        date: form.date,
        title: form.title,
        description: form.description,
        category: form.category,
      }),
    );
    setForm({
      date: new Date().toISOString(),
      title: "",
      description: "",
      category: "milestone",
    });
  };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "auto 1fr" }}>
      <div>
        <form
          id="event-form"
          name="event-form"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 5,
            padding: 15,
            border: "1px solid grey",
            borderRadius: 15,
          }}
        >
          <label htmlFor="title">Title:</label>
          <input
            autoFocus
            name="title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Event title"
          />
          <label htmlFor="date">Date:</label>
          <input
            name="date"
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
          <label htmlFor="description">Description:</label>
          <input
            name="description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Event Description"
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
            disabled={form.title === ""}
            type="submit"
            style={{
              width: 75,
              alignSelf: "center",
              padding: 2,
              marginTop: 15,
              backgroundColor: "green",
              color: "white",
              borderRadius: 15,
              border: "1px solid black",
              boxShadow: "2px 4px 6px grey",
              cursor: "pointer",
            }}
            onClick={handleCreate}
          >
            Add
          </button>
        </form>

        <ul
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 5,
            padding: 10,
            border: "1px solid grey",
            borderRadius: 15,
          }}
        >
          {events.map((event: Event) => (
            <li
              key={event.id}
              style={{
                display: "flex",
                gap: 5,
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              {event.title} - {new Date(event.date).toLocaleDateString()}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm("Are you sure?")) {
                    dispatch(deleteEvent(event.id));
                  }
                }}
                style={{
                  marginTop: "8px",
                  background: "red",
                  color: "white",
                  border: "none",
                  padding: "4px 8px",
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div
        id="timeline-container-1"
        style={{
          width: "100%",
          height: "100vh",
          maxWidth: "100%",
          padding: "40px",
          boxSizing: "border-box",
          overflowY: "auto",
        }}
      >
        <ParentSize debounceTime={10}>
          {({ width }) => <NewTimeline width={width} />}
        </ParentSize>
      </div>
    </div>
  );
}

export default App;
