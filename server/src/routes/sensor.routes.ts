import { Router } from "express";
import * as sensorController from "../controller/sensor.controller";

const router = Router();

router.post("/", sensorController.postData); // Endpoint: POST /api/sensors
router.get("/", sensorController.getData); // Endpoint: GET /api/sensors?userId=1

export default router;
