import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://localhost:3000/events";

// 🔄 GET events
export const fetchEvents = createAsyncThunk("events/fetchEvents", async () => {
  const response = await axios.get(API_URL);
  return response.data;
});

// ➕ CREATE event
export const createEvent = createAsyncThunk(
  "events/createEvent",
  async (eventData: { title: string; description: string; date: string }) => {
    const response = await axios.post(API_URL, eventData);
    return response.data;
  }
);
// ✏️ UPDATE event
export const updateEvent = createAsyncThunk(
  "events/updateEvent",
  async (event: {
    id: number;
    title: string;
    description: string;
    date: string;
  }) => {
    const response = await axios.put(
      `http://localhost:3000/events/${event.id}`,
      event
    );
    return response.data;
  }
);

// ➖ DELETE event
export const deleteEvent = createAsyncThunk(
  "events/deleteEvent",
  async (id: number) => {
    await axios.delete(`http://localhost:3000/events/${id}`);
    return id;
  }
);

export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
}

interface EventsState {
  items: Event[];
  status: "idle" | "loading" | "succeeded" | "failed";
}

const initialState: EventsState = {
  items: [],
  status: "idle",
};

const eventsSlice = createSlice({
  name: "events",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // FETCH
      .addCase(fetchEvents.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })

      // CREATE
      .addCase(createEvent.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })

      // ✏️ UPDATE
      .addCase(updateEvent.fulfilled, (state, action) => {
        const index = state.items.findIndex(
            (e) => e.id === action.payload.id
        );
        if (index !== -1) {
            state.items[index] = action.payload;
        }
      })

      // ➖ DELETE
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.items = state.items.filter(
            (event) => event.id !== action.payload
        );
      });
    }
});

export default eventsSlice.reducer;