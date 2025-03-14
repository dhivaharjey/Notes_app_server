import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/userSchema.js";
import {
  generateAccesToken,
  generateRefreshToken,
} from "../helper/generateToken.js";
dotenv.config();

async function authentication(req, res, next) {
  try {
    console.log("middle");
    console.log(req.cookies);

    const accessToken = req.cookies?.accessToken;
    const refreshToken = req.cookies?.refreshToken;
    console.log(accessToken, refreshAccessToken);

    if (!accessToken) {
      if (!refreshToken) {
        return res.status(401).json({ message: "Access Denied: No token  " });
      } else {
        return await refreshAccessToken(req, res, next);
      }
    }

    jwt.verify(
      accessToken,
      process.env.JWT_ACCESS_SECRET,
      async (err, decoded) => {
        if (err) {
          if (refreshToken) {
            console.log("Access token expired, attempting refresh...");
            return await refreshAccessToken(req, res, next);
          } else {
            return res
              .status(401)
              .json({ message: "Access Denied: No refresh token " });
          }
        }

        const user = await User.findById(decoded?.id);

        // req.user = { id: user?._id };
        req.user = user.toJSON();
        // console.log(req.user);

        next();
      }
    );
  } catch (error) {
    return res.status(500).json({ message: error?.message });
  }
}

async function refreshAccessToken(req, res, next) {
  const refreshToken = req.cookies?.refreshToken;
  // console.log("refresg");

  if (!refreshToken) {
    return res
      .status(401)
      .json({ message: "Access Denied: No  refresh token " });
  }

  jwt.verify(
    refreshToken,
    process.env.JWT_REFRESH_SECRET,
    async (refreshErr, refreshDecoded) => {
      if (refreshErr) {
        return res
          .status(401)
          .json({ message: "Access Denied: No  refresh token " });
      }
      const user = await User.findOne({
        _id: refreshDecoded?.id,
        refreshToken,
      });
      if (!user) {
        return res
          .status(403)
          .json({ message: "Session expired, please login again." });
      }
      const newRefreshToken = generateRefreshToken(user?._id);
      const newAccessToken = generateAccesToken(user?._id);

      user.refreshToken = newRefreshToken;
      // user.markModified("refreshToken");
      await user.save();

      const options = {
        httpOnly: true,
        secure: true,
        sameSite: "None",
      };
      res
        .cookie("accessToken", newAccessToken, {
          ...options,
          // domain: ".vercel.app",
          maxAge: 15 * 60 * 1000,
        })
        .cookie("refreshToken", newRefreshToken, {
          ...options,
          // domain: ".vercel.app",
          maxAge: 2 * 24 * 60 * 60 * 1000,
        })
        .status(200);
      // .json({ message: "Token refreshed" });
      req.user = user.toJSON();
      next();
    }
  );
}

export { authentication };
