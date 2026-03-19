import { useEffect, useState } from "react";
import {
  fetchEvents,
  createEvent,
  deleteEvent,
} from "./features/events/eventsSlice";
import Timeline from "./components/Timeline";
import { useAppDispatch, useAppSelector } from "./hooks/storeHooks";

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
    <div style={{ padding: "20px", border: "4px solid #29b81c" }}>
      <h1>Events</h1>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Event title"
      />
      <button onClick={handleCreate}>Add</button>

      <ul>
        {events.map((event) => (
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
      <Timeline />
    </div>
  );
}

export default App;
