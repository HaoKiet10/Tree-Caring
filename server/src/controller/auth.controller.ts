import { Request, Response } from "express";
import * as authService from "../service/auth.service";
import { registerSchema, loginSchema } from "../utils/validation";
import { z, ZodError } from "zod";

export const register = async (req: Request, res: Response) => {
  try {
    // Validate
    console.log(req.body);
    const { email, password, fullName } = registerSchema.parse(req.body);
    console.log(email, password, fullName);

    // Call Service
    const user = await authService.registerUser(email, password, fullName);
    console.log(user);

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
        .json({ success: false, error: error.issues[0].message });
    }
    res.status(401).json({ success: false, error: error.message });
  }
};
