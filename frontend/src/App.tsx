import { ParentSize } from "@visx/responsive";
import NewTimeline from "./components/NewTimeline";
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

  const [title, setTitle] = useState("");
  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  const handleCreate = () => {
    dispatch(
      createEvent({
        title,
        description: "Test description",
        date: new Date().toISOString(),
      }),
    );
    setTitle("");
  };
  return (
    <div style={{ display: "flex" }}>
      <div>
        <h1>Events</h1>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Event title"
        />
        <button onClick={handleCreate}>Add</button>

        <ul>
          {events.map((event: Event) => (
            <li key={event.id}>
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
