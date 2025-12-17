import prisma from "../config/db";
import { WateringControlInput } from "../utils/validation"; // Đảm bảo interface này có đủ các trường bên dưới
import mqtt from "mqtt";

client.on("connect", () => {
  console.log("✅ Music Service: Đã kết nối MQTT HiveMQ");

  // 👇 SUBSCRIBE trạng thái tưới nước
  client.subscribe("garden/watering/status", { qos: 1 }, (err) => {
    if (err) {
      console.error("❌ Subscribe watering status thất bại", err);
    } else {
      console.log("📡 Đã subscribe garden/watering/status");
    }
  });
});

client.on("message", async (topic, message) => {
  try {
    if (topic === "garden/watering/status") {
      const payload = JSON.parse(message.toString());

      console.log("🚿 Watering status:", payload);

      // ESP báo đã tưới xong
      if (payload.event === "PUMP_DONE") {
        await prisma.wateringControl.update({
          where: { userId: 1 }, // hoặc lấy từ payload
          data: {
            pumpStatus: false,
            lastWateredAt: new Date(),
          },
        });

        console.log("✅ Đã cập nhật DB: pump OFF");
      }
    }
  } catch (err) {
    console.error("❌ MQTT watering message error:", err);
  }
});

export const publishWateringCommand = (
  action: "START" | "STOP",
 
) => {
  const topic = "garden/watering/control";

  const payload = JSON.stringify({
    action,
  });

  return new Promise((resolve, reject) => {
    client.publish(topic, payload, { qos: 1 }, (err) => {
      if (err) {
        console.error("❌ Gửi lệnh tưới thất bại:", err);
        reject(err);
      } else {
        console.log(`🚿 Đã gửi lệnh tưới: ${payload}`);
        resolve(true);
      }
    });
  });
};

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
  publishWateringCommand,
};
