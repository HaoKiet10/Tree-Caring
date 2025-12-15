import express, { Express } from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import sensorRoutes from "./routes/sensor.routes";
import wateringRoutes from "./routes/watering.routes";
import songRoutes from "./routes/song.routes";

import { connectMQTT } from "./service/mqtt.service";
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/sensors", sensorRoutes);
app.use("/api/watering", wateringRoutes);
app.use("/api/songs", songRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("IoT Server is running with TypeScript!");
});

// start mqtt
connectMQTT();

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});
