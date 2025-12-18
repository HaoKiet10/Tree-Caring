import { Request, Response } from "express";
import { sendEmailToUser } from "../service/email.service";

export const sendReport = async (req: Request, res: Response) => {
  const { email } = req.body; // Nhận email từ Frontend gửi lên

  await sendEmailToUser(email);

  res.json({ success: true });
};
