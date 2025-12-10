import prisma from "../config/db";
import bcrypt from "bcryptjs";
import { RegisterInput } from "../utils/validation";

export const registerUser = async (data: RegisterInput) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error("Email đã tồn tại");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const newUser = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash: hashedPassword,
      fullName: data.fullName,
    },
  });

  // Loại bỏ password trước khi trả về (Dùng destructuring)
  const { passwordHash, ...userWithoutPass } = newUser;
  return userWithoutPass;
};

export const loginUser = async (email: string, pass: string) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) throw new Error("Tài khoản hoặc mật khẩu sai");

  const isValid = await bcrypt.compare(pass, user.passwordHash);
  if (!isValid) throw new Error("Tài khoản hoặc mật khẩu sai");

  const { passwordHash, ...userWithoutPass } = user;
  return userWithoutPass;
};
