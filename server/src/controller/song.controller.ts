import { Request, Response } from "express";
import * as songService from "../service/song.service";

// API 1: Lấy danh sách bài hát (GET)
export const getSongs = async (req: Request, res: Response) => {
  try {
    const songs = await songService.getAllSongs();

    // Format lại dữ liệu nếu cần (ví dụ thêm url giả nếu DB thiếu)
    const formattedSongs = songs.map((song: any) => ({
      ...song,
    }));

    res.status(200).json(formattedSongs);
  } catch (error) {
    console.error("Lỗi lấy danh sách nhạc:", error);
    res.status(500).json({ message: "Lỗi server khi lấy bài hát", error });
  }
};

// API 2: Điều khiển nhạc (POST)
export const controlSong = async (req: Request, res: Response) => {
  const { action, songId } = req.body; // action: 'PLAY' hoặc 'STOP'

  // Validate đầu vào
  if (!action || (action !== "PLAY" && action !== "STOP")) {
    return res
      .status(400)
      .json({ message: "Action không hợp lệ (chỉ PLAY/STOP)" });
  }

  try {
    // Gọi service để bắn MQTT
    await songService.publishSongCommand(action, songId);

    res.status(200).json({
      message: "Đã gửi lệnh xuống Arduino thành công",
      data: { action, songId },
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi gửi lệnh MQTT", error });
  }
};

export default {
  getSongs,
  controlSong,
};
