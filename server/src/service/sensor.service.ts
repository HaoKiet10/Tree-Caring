import prisma from "../config/db";
import { SensorInput } from "../utils/validation";

export const saveSensorData = async (data: SensorInput) => {
  // Lưu vào DB
  return await prisma.sensorLog.create({
    data: {
      userId: data.userId,
      temperature: data.temp,
      humidity: data.hum,
      soilMoisture: data.soil,
      lightIntensity: data.light,
    },
  });
};

export const getLatestSensorData = async (userId: number) => {
  const logs = await prisma.sensorLog.findMany({
    where: { userId },
    orderBy: { recordedAt: "desc" },
    take: 12,
  });

  return {
    current: logs[0],
    history: logs.reverse(),
  };
};
