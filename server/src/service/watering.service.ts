import prisma from "../config/db";
import { WateringControlInput } from "../utils/validation"; // Đảm bảo interface này có đủ các trường bên dưới
import mqtt from "mqtt";
import axios from "axios";
const mqttOptions: mqtt.IClientOptions = {
  host: "broker.hivemq.com", // Hoặc broker của bạn
  port: 1883,
  protocol: "mqtt",
};

const client = mqtt.connect(mqttOptions);

client.on("connect", () => {
  console.log("✅ Music Service: Đã kết nối MQTT HiveMQ");

  // 👇 SUBSCRIBE trạng thái tưới nước
  client.subscribe("078116497/Pump", { qos: 2 }, (err) => {
    if (err) {
      console.error("❌ Subscribe watering status thất bại", err);
    } else {
      console.log("📡 Đã subscribe 078116497/Pump");
    }
  });
});

client.on("message", async (topic, message) => {
  try {
    if (topic === "078116497/Pump") {
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
export const publishWateringCommand = (action: "ON" | "OFF") => {
  return new Promise(async (resolve, reject) => {
    client.publish("078116497/Pump", action, { qos: 1 }, async (err) => {
      if (err) {
        console.error("❌ Gửi lệnh tưới thất bại:", err);
        reject(err);
      } else {
        console.log(`🚿 Đã gửi lệnh tưới: ${action}`);

        // 🔔 CALL PUSHSAFER NGAY TẠI ĐÂY
        if (action === "ON") {
          try {
            await axios.get("https://www.pushsafer.com/api", {
              params: {
                k: "HjAd02N6nuSNjHBl5cNb",
                v: 2,
                m: "🚿 Hệ thống đã pump nước",
              },
            });

            console.log("📲 Pushsafer: Notification sent");
          } catch (e) {
            console.error("❌ Pushsafer error:", e);
          }
        }

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
      lastWateredAt: data.last_watered_at,
      updatedAt: new Date(),
    },
    // Nếu KHÔNG tìm thấy -> Tạo mới với giá trị này
    create: {
      userId: data.userId,
      pumpStatus: data.pump_status || false,
      mode: data.mode || "MANUAL",
      soilThreshold: data.soil_threshold || 30,
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
