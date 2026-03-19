import pool from "../db/db.js";

export const getEvents = async () => {
  const result = await pool.query(
    "SELECT * FROM events ORDER BY date ASC"
  );

  return result.rows;
};

export const createEvent = async (title, description, date) => {
  const result = await pool.query(
    `INSERT INTO events (title, description, date)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [title, description, date]
  );

  return result.rows[0];
};

export const updateEvent = async (id, title, description, date) => {
  const result = await pool.query(
    `UPDATE events
     SET title = $1, description = $2, date = $3
     WHERE id = $4
     RETURNING *`,
    [title, description, date, id]
  );

  return result.rows[0];
};

export const deleteEvent = async (id) => {
  await pool.query(
    `DELETE FROM events
     WHERE id = $1`,
    [id]
  );
};
