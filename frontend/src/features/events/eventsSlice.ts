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

interface Event {
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
      });
  },
});

export default eventsSlice.reducer;