import * as wateringService from "../service/watering.service";
import { Request, Response } from "express";

// Fix lỗi JSON BigInt
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

export const getWateringStatus = async (req: Request, res: Response) => {
  const userId = Number(req.params.userId);

  // Validate ID
  if (isNaN(userId)) {
    return res.status(400).json({ message: "Invalid User ID" });
  }

  try {
    const status = await wateringService.getWateringControlByUserId(userId);
    // Nếu chưa có data, trả về null để frontend biết
    res.status(200).json(status);
  } catch (error) {
    console.error("Error getting status:", error);
    res
      .status(500)
      .json({ message: "Lỗi khi lấy trạng thái tưới nước", error });
  }
};

export const updateWateringStatus = async (req: Request, res: Response) => {
  const userId = Number(req.params.userId);

  if (isNaN(userId)) {
    return res.status(400).json({ message: "Invalid User ID" });
  }

  // LẤY TẤT CẢ DỮ LIỆU TỪ BODY (Quan trọng)
  const {
    pump_status,
    mode,
    soil_threshold,
    max_pump_duration,
    last_watered_at,
  } = req.body;

  try {
    // Gọi hàm upsert để xử lý cả tạo mới và cập nhật
    const updatedStatus = await wateringService.upsertWateringControl({
      userId,
      pump_status,
      mode,
      soil_threshold,
      max_pump_duration,
      last_watered_at,
    });

    res.status(200).json(updatedStatus);
  } catch (error) {
    console.error("Error updating status:", error);
    res
      .status(500)
      .json({ message: "Lỗi khi cập nhật trạng thái tưới nước", error });
  }
};

// Hàm create có thể bỏ đi hoặc giữ lại để trỏ về update (vì upsert đã cân cả 2)
export const createWateringStatus = updateWateringStatus;

export default {
  getWateringStatus,
  updateWateringStatus,
  createWateringStatus,
};
