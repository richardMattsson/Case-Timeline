import pool from "../db/db.js";

export const getEvents = async () => {
  const result = await pool.query("SELECT * FROM events ORDER BY date ASC");

  return result.rows;
};

export const createEvent = async (date, title, description, category) => {
  const result = await pool.query(
    `INSERT INTO events ( date, title, description, category)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [date, title, description, category],
  );

  return result.rows[0];
};

export const updateEvent = async (date, title, description, category, id) => {
  const result = await pool.query(
    `UPDATE events
     SET date = $1, title = $2, description = $3, category = $4 
     WHERE id = $5
     RETURNING *`,
    [date, title, description, category, id],
  );

  return result.rows[0];
};

export const deleteEvent = async (id) => {
  await pool.query(
    `DELETE FROM events
     WHERE id = $1`,
    [id],
  );
};
