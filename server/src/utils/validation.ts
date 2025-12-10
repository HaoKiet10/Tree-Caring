import { z } from "zod";

// --- Auth Schemas ---
export const registerSchema = z.object({
  email: z.string().email("Email không hợp lệ").trim().toLowerCase(),
  password: z
    .string()
    .min(8, "Mật khẩu tối thiểu 8 ký tự")
    .regex(/[A-Z]/, "Cần ít nhất 1 chữ hoa")
    .regex(/[0-9]/, "Cần ít nhất 1 số"),
  fullName: z.string().min(2, "Tên quá ngắn").max(50),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Tự động tạo Type TS từ Schema
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

// --- Sensor Schemas ---
export const sensorDataSchema = z.object({
  userId: z.number(),
  temp: z.number(),
  hum: z.number(),
  soil: z.number(),
  light: z.number(),
});

export type SensorInput = z.infer<typeof sensorDataSchema>;
