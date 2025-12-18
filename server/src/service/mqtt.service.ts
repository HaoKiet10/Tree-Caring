import mqtt from "mqtt";
import { Server } from "socket.io";
import { saveSensorData } from "./sensor.service";
import { sensorDataSchema } from "../utils/validation";

// --- CẤU HÌNH TOPIC ---
const BROKER_URL = "ws://broker.hivemq.com:8000/mqtt"; // Sử dụng WebSocket cho Broker public
const RECEIVE_SENSOR_TOPIC = "078116497/sensor"; // Topic nhận dữ liệu cảm biến
const RECEIVE_MUSIC_TOPIC = "garden/song/status"; // Topic nhận trạng thái nhạc từ Arduino

export const connectMQTT = (io: Server) => {
  const client = mqtt.connect(BROKER_URL);

  client.on("connect", () => {
    console.log("✅ MQTT Service: Đã kết nối tới Broker thành công");

    // Đăng ký lắng nghe cả 2 topic cùng lúc
    client.subscribe([RECEIVE_SENSOR_TOPIC, RECEIVE_MUSIC_TOPIC], (err) => {
      if (!err) {
        console.log(
          `📡 Đã subscribe: [${RECEIVE_SENSOR_TOPIC}] và [${RECEIVE_MUSIC_TOPIC}]`
        );
      }
    });
  });

  // Xử lý khi có tin nhắn đến từ bất kỳ topic nào
  client.on("message", async (topic: string, message: Buffer) => {
    const payloadStr = message.toString();

    try {
      const payloadJson = JSON.parse(payloadStr);

      // --- TRƯỜNG HỢP 1: DỮ LIỆU CẢM BIẾN ---
      if (topic === RECEIVE_SENSOR_TOPIC) {
        console.log("📩 Nhận dữ liệu cảm biến:", payloadJson);

        // 1. Validate dữ liệu bằng Zod/Joi
        const validatedData = sensorDataSchema.parse(payloadJson);

        // 2. Lưu vào Database
        await saveSensorData(validatedData);

        // 3. (Tùy chọn) Gửi dữ liệu mới nhất lên Web để cập nhật biểu đồ ngay lập tức
        io.emit("sensor_update", validatedData);

        console.log("💾 Đã lưu DB và cập nhật cho Frontend");
      }

      // --- TRƯỜNG HỢP 2: TRẠNG THÁI NHẠC TỪ ARDUINO ---
      if (topic === RECEIVE_MUSIC_TOPIC) {
        console.log("🎵 Nhận phản hồi âm nhạc:", payloadJson);

        // Giả sử Arduino gửi: { "event": "FINISHED", "song_id": 123 }
        if (payloadJson.event === "FINISHED") {
          console.log(
            `✨ Bài hát ${payloadJson.song_id} đã phát xong trên thiết bị.`
          );

          // Bắn tín hiệu Real-time qua Socket.io đến các trình duyệt đang mở
          io.emit("song_finished", {
            songId: payloadJson.song_id,
            timestamp: new Date().toISOString(),
          });
        }
      }
    } catch (error) {
      console.error(`❌ Lỗi xử lý MQTT tại topic ${topic}:`, error);
    }
  });

  client.on("error", (err) => {
    console.error("❌ MQTT Connection Error:", err);
  });

  return client;
};
