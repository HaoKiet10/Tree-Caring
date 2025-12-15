import WateringController from "../controller/watering.controller";
import express from "express";

const router = express.Router();
router.get("/:userId", WateringController.getWateringStatus);
router.post("/:userId", WateringController.createWateringStatus);
router.put("/:userId", WateringController.updateWateringStatus);

export default router;
