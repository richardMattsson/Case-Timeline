import express from "express";
import cors from "cors";
import eventsRoutes from "./routes/eventsRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/events", eventsRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});