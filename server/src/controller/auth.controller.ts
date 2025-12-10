import { Request, Response } from "express";
import * as authService from "../service/auth.service";
import { registerSchema, loginSchema } from "../utils/validation";
import { z, ZodError } from "zod";

export const register = async (req: Request, res: Response) => {
  try {
    // Validate
    const validatedData = registerSchema.parse(req.body);

    // Call Service
    const user = await authService.registerUser(validatedData);

    res.status(201).json({ success: true, user });
  } catch (error: any) {
    // Xử lý lỗi Zod
    if (error instanceof ZodError) {
      return res
        .status(400)
        .json({ success: false, error: error.issues[0].message });
    }
    res.status(400).json({ success: false, error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await authService.loginUser(email, password);

    res.status(200).json({ success: true, user });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ success: false, error: "Dữ liệu không hợp lệ" });
    }
    res.status(401).json({ success: false, error: error.message });
  }
};
