import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import eventsRoutes from "./routes/eventsRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/events", eventsRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
