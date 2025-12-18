import prisma from "../config/db";
import { publishWateringCommand } from "./watering.service";

export const handleAutoWatering = async (
  userId: number,
  soilMoisture: number
) => {
  const config = await prisma.wateringControl.findUnique({
    where: { userId },
  });

  if (!config) return;

  const { soilThreshold, pumpStatus, mode } = config;

  // ❌ Không AUTO thì thôi
  if (mode !== "AUTO" || soilThreshold === null) return;

  // 🚿 CHỈ GỬI ON Ở ĐÂY
  if (soilMoisture < soilThreshold! && pumpStatus === false) {
    await publishWateringCommand("ON");

    // 🔒 khóa ngay
    await prisma.wateringControl.update({
      where: { userId },
      data: { pumpStatus: true },
    });
  }
};
