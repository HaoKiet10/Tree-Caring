import prisma from "../config/db";
import mqtt from "mqtt";

// --- CẤU HÌNH MQTT ---
// Sử dụng cùng Broker với file mqtt.service để đồng bộ
const BROKER_URL = "mqtt://broker.hivemq.com:1883"; // Sử dụng WebSocket cho Broker public
const CONTROL_TOPIC = "078116497/music";

const client = mqtt.connect(BROKER_URL);

client.on("connect", () => {
  console.log(" Song Service: Đã kết nối MQTT để gửi lệnh");
});

client.on("error", (err) => {
  console.error(" Song Service: Lỗi kết nối MQTT", err);
});

/**
 * 1. Lấy danh sách tất cả bài hát từ Database
 */
export const getAllSongs = async () => {
  try {
    return await prisma.song.findMany({
      orderBy: {
        songId: "asc",
      },
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách nhạc từ DB:", error);
    throw error;
  }
};

export const publishSongCommand = (
  action: "PLAY" | "STOP",
  songId?: number
) => {
  const payload = JSON.stringify({
    action: action,
    song_id: songId || 0,
  });

  return new Promise((resolve, reject) => {
    // Gửi tin nhắn với QoS 1 để đảm bảo Arduino nhận được lệnh
    client.publish(CONTROL_TOPIC, payload, { qos: 1 }, (err) => {
      if (err) {
        console.error(" Gửi MQTT thất bại:", err);
        reject(err);
      } else {
        console.log(` Đã gửi lệnh nhạc xuống Arduino: ${payload}`);
        resolve(true);
      }
    });
  });
};

export default {
  getAllSongs,
  publishSongCommand,
};
