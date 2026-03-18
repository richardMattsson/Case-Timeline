import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchEvents, createEvent } from "./features/events/eventsSlice";
import type { RootState, AppDispatch } from "./app/store";

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const events = useSelector((state: RootState) => state.events.items);

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
    <div style={{ padding: "20px" }}>
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
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
