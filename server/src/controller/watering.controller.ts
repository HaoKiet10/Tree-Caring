import * as wateringService from "../service/watering.service";
import { Request, Response } from "express";

// Fix lỗi JSON BigInt
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

/**
 * GET /watering/:userId
 * Web chỉ đọc trạng thái từ DB
 */
export const getWateringStatus = async (req: Request, res: Response) => {
  const userId = Number(req.params.userId);

  if (isNaN(userId)) {
    return res.status(400).json({ message: "Invalid User ID" });
  }

  try {
    const status = await wateringService.getWateringControlByUserId(userId);
    return res.status(200).json(status);
  } catch (error) {
    console.error("Error getting watering status:", error);
    return res
      .status(500)
      .json({ message: "Lỗi khi lấy trạng thái tưới nước" });
  }
};

/**
 * POST /watering/:userId
 * Web bấm nút → backend:
 * 1. Update DB
 * 2. Publish MQTT xuống ESP
 */
export const updateWateringStatus = async (req: Request, res: Response) => {
  const userId = Number(req.params.userId);

  if (isNaN(userId)) {
    return res.status(400).json({ message: "Invalid User ID" });
  }

  const {
    pump_status,
    mode,
    soil_threshold,
    max_pump_duration,
  } = req.body;

  try {
    // 1️⃣ Update DB (source of truth)
    const updatedStatus = await wateringService.upsertWateringControl({
      userId,
      pump_status,
      mode,
      soil_threshold,
      max_pump_duration,
    });

    // 2️⃣ Nếu bật pump → gửi lệnh MQTT
    if (pump_status === true) {
      await wateringService.publishWateringCommand(
        "START",
        max_pump_duration
      );
    } else {
      await wateringService.publishWateringCommand("STOP");
    }

    return res.status(200).json(updatedStatus);
  } catch (error) {
    console.error("Error updating watering status:", error);
    return res
      .status(500)
      .json({ message: "Lỗi khi cập nhật trạng thái tưới nước" });
  }
};

// Vì dùng upsert nên create = update
export const createWateringStatus = updateWateringStatus;

export default {
  getWateringStatus,
  updateWateringStatus,
  createWateringStatus,
};