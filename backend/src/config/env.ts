import dotenv from "dotenv";
dotenv.config();

export const env = {
  JWT_SECRET: process.env.JWT_SECRET || "lentera-secret-key-change-in-production",
  PORT: Number(process.env.PORT) || 3000,
};
