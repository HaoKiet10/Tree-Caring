import { Request, Response } from "express";
import * as sensorService from "../service/sensor.service";
import { sensorDataSchema } from "../utils/validation";
import { number } from "zod";

// POST: Nhận dữ liệu từ ESP32
export const postData = async (req: Request, res: Response) => {
  try {
    const validatedData = sensorDataSchema.parse(req.body);
    const newLog = await sensorService.saveSensorData(validatedData);

    // Vì logId là BigInt, JSON.stringify sẽ lỗi, cần convert sang String
    res.status(201).json({ success: true, id: newLog.logId.toString() });
  } catch (error) {
    console.error("Sensor Error:", error);
    res.status(500).json({ success: false, error: "Lỗi lưu dữ liệu" });
  }
};

// GET: Trả dữ liệu cho Frontend
export const getData = async (req: Request, res: Response) => {
  console.log("Received getData request with userId:", req.query);
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: "Thiếu userId" });
    }

    const data = await sensorService.getLatestSensorData(Number(userId));

    const jsonString = JSON.stringify(data);

    res.status(200).send(jsonString);
  } catch (error) {
    res.status(500).json({ error: "Lỗi lấy dữ liệu" });
  }
};
