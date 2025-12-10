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
  const current = await prisma.sensorLog.findFirst({
    where: { userId },
    orderBy: { recordedAt: "desc" },
  });

  const history = await prisma.sensorLog.findMany({
    where: { userId },
    orderBy: { recordedAt: "desc" },
    take: 12, // Lấy 12 bản ghi gần nhất
  });

  return {
    current,
    history: history.reverse(),
  };
};
