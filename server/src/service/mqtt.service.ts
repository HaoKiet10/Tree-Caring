import mqtt from "mqtt";
import { saveSensorData } from "./sensor.service"; // Hàm lưu DB cũ
import { sensorDataSchema } from "../utils/validation";

// Kết nối đến Broker (Ví dụ dùng Broker public để test, thực tế nên dùng Private)
const BROKER_URL = "ws://broker.hivemq.com:8000/mqtt";
const TOPIC = "home/garden/sensor-data";

export const connectMQTT = () => {
  const client = mqtt.connect(BROKER_URL);

  client.on("connect", () => {
    console.log("✅ Đã kết nối tới MQTT Broker");

    // Đăng ký lắng nghe topic
    client.subscribe(TOPIC, (err: Error | null) => {
      if (!err) {
        console.log(`📡 Đang lắng nghe tại topic: ${TOPIC}`);
      }
    });
  });

  // Xử lý khi có tin nhắn đến
  client.on("message", async (topic: string, message: Buffer) => {
    if (topic === TOPIC) {
      try {
        // 1. Chuyển Buffer thành String rồi thành JSON
        const payloadStr = message.toString();
        const payloadJson = JSON.parse(payloadStr);

        console.log("📩 Nhận dữ liệu:", payloadJson);

        // 2. Validate dữ liệu
        const validatedData = sensorDataSchema.parse(payloadJson);

        // 3. Lưu vào Database (Gọi Service cũ)
        await saveSensorData(validatedData);

        console.log("💾 Đã lưu vào Database thành công!");
      } catch (error) {
        console.error("❌ Lỗi xử lý dữ liệu MQTT:", error);
      }
    }
  });

  return client;
};
