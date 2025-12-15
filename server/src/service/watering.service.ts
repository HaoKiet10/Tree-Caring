import prisma from "../config/db";
import { WateringControlInput } from "../utils/validation"; // Đảm bảo interface này có đủ các trường bên dưới

// Hàm Upsert: Tự động Tạo hoặc Cập nhật
export const upsertWateringControl = async (data: WateringControlInput) => {
  return await prisma.wateringControl.upsert({
    where: {
      userId: data.userId, // Tìm theo userId
    },
    // Nếu tìm thấy -> Update các trường này
    update: {
      pumpStatus: data.pump_status,
      mode: data.mode,
      soilThreshold: data.soil_threshold,
      maxPumpDuration: data.max_pump_duration,
      lastWateredAt: data.last_watered_at,
      updatedAt: new Date(),
    },
    // Nếu KHÔNG tìm thấy -> Tạo mới với giá trị này
    create: {
      userId: data.userId,
      pumpStatus: data.pump_status || false,
      mode: data.mode || "MANUAL",
      soilThreshold: data.soil_threshold || 30,
      maxPumpDuration: data.max_pump_duration || 10,
      lastWateredAt: data.last_watered_at,
      updatedAt: new Date(),
    },
  });
};

export const getWateringControlByUserId = async (userId: number) => {
  const data = await prisma.wateringControl.findUnique({
    where: { userId: userId },
  });
  return data;
};

export default {
  upsertWateringControl,
  getWateringControlByUserId,
};
