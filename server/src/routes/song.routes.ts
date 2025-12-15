import express from "express";
import songController from "../controller/song.controller";

const router = express.Router();

// 1. Route lấy danh sách bài hát
// GET http://localhost:4000/api/songs
router.get("/", songController.getSongs);

// 2. Route điều khiển phát/tắt
// POST http://localhost:4000/api/song/control
router.post("/control", songController.controlSong);

export default router;
