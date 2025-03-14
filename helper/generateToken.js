import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const generateAccesToken = (id) => {
  const accessToken = jwt.sign({ id }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "15m",
  });

  return accessToken;
};
export const generateRefreshToken = (id) => {
  const refreshToken = jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "2d",
  });

  return refreshToken;
};
