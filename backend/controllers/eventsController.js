import * as eventsService from "../services/eventsService.js";

export const getEvents = async (req, res) => {
  try {
    const events = await eventsService.getEvents();
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch events" });
  }
};

export const createEvent = async (req, res) => {
  const { date, title, description, category } = req.body;

  try {
    const event = await eventsService.createEvent(
      date,
      title,
      description,
      category,
    );

    res.status(201).json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not create event" });
  }
};

export const updateEvent = async (req, res) => {
  const { id } = req.params;
  const { date, title, description, category } = req.body;

  try {
    const event = await eventsService.updateEvent(
      id,
      date,
      title,
      description,
      category,
    );
    res.json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not update event" });
  }
};

export const deleteEvent = async (req, res) => {
  const { id } = req.params;

  try {
    await eventsService.deleteEvent(id);
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not delete event" });
  }
};
