import { Request, Response } from "express";
import * as sensorService from "../service/sensor.service";
import { sensorDataSchema } from "../utils/validation";

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
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: "Thiếu userId" });
    }

    const data = await sensorService.getLatestSensorData(
      parseInt(userId as string)
    );

    // Xử lý BigInt cho JSON response (nếu có field BigInt nào lọt vào)
    const jsonString = JSON.stringify(data, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    );

    res.status(200).send(jsonString);
  } catch (error) {
    res.status(500).json({ error: { error } });
  }
};
