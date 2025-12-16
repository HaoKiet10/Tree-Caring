import prisma from "../config/db";
import { SensorInput } from "../utils/validation";

export const saveSensorData = async (data: SensorInput) => {
  // Lưu vào DB
  return await prisma.sensorLog.create({
    data: {
      deviceId: data.deviceId,
      temperature: data.temperature,
      humidity: data.humidity,
      soilMoisture: data.soil,
      lightIntensity: data.light,
    },
  });
};

export const getLatestSensorData = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: { userId },
    select: { deviceId: true },
  });

  if (!user) {
    throw new Error("User không tồn tại");
  }

  const history = await prisma.sensorLog.findMany({
    where: { deviceId: user.deviceId || 0 },
    orderBy: { recordedAt: "desc" },
    take: 12,
  });

  return {
    latest: history[0],
    history: history.reverse(),
  };
};
