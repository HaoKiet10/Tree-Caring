import prisma from "../config/db";
import mqtt from "mqtt";

// --- CẤU HÌNH MQTT ---
const mqttOptions: mqtt.IClientOptions = {
  host: "broker.hivemq.com", // Hoặc broker của bạn
  port: 1883,
  protocol: "mqtt",
};

const client = mqtt.connect(mqttOptions);

client.on("connect", () => {
  console.log("✅ Music Service: Đã kết nối MQTT HiveMQ");
});

client.on("error", (err) => {
  console.error("❌ Music Service: Lỗi kết nối MQTT", err);
});

// --- LOGIC DATABASE ---

// 1. Lấy tất cả bài hát từ DB
export const getAllSongs = async () => {
  return await prisma.song.findMany({
    orderBy: {
      songId: "asc", // Sắp xếp theo ID
    },
  });
};

// --- LOGIC MQTT ---

// 2. Gửi lệnh điều khiển xuống Arduino
export const publishSongCommand = (
  action: "PLAY" | "STOP",
  songId?: number
) => {
  const topic = "garden/song/control";

  const payload = JSON.stringify({
    action: action,
    song_id: songId || 0,
  });

  return new Promise((resolve, reject) => {
    client.publish(topic, payload, { qos: 1 }, (err) => {
      if (err) {
        console.error("Gửi MQTT thất bại:", err);
        reject(err);
      } else {
        console.log(`📡 Đã gửi lệnh nhạc: ${payload}`);
        resolve(true);
      }
    });
  });
};

export default {
  getAllSongs,
  publishSongCommand,
};
