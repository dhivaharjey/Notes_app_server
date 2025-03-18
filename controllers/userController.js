import {
  generateAccesToken,
  generateRefreshToken,
} from "../helper/generateToken.js";
import User from "../models/userSchema.js";
import { inputDataValidation } from "../Utils/helper.js";
import dotenv from "dotenv";
dotenv.config();

export const userRegister = async (req, res) => {
  try {
    // const { userName, email, password, confirmPassword } = req.body;
    const { userName, email, password, confirmPassword } = inputDataValidation(
      req.body
    );
    const user = await User.findOne({
      $or: [{ email }, { userName }],
    });

    if (user?.email === email) {
      return res.status(409).json({ message: "User Already Exists" });
    }
    if (user?.userName === userName) {
      return res.status(409).json({ message: "User Name is Already taken" });
    }

    const newUser = new User({
      userName,
      email,
      password,
    });
    await newUser.save();
    // const userData = newUser.toJSON();
    // console.log(newUser);

    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    // console.log(error?.message);

    return res
      .status(500)
      .json({ message: error?.message || "Internal Server Error" });
  }
};

export const userLogin = async (req, res) => {
  try {
    // console.log("body", req.body);

    // const { email, password } = req.body;

    const { email, password } = inputDataValidation(req.body);
    // console.log(data);

    // const validatedData = loginValidation(req.body);
    // console.log(validatedData);

    const user = await User.findOne({ email: email });

    if (!user) {
      return res
        .status(409)
        .json({ message: "User not found or Invalid Email" });
    }

    const isPasswordMatching = await user.comparePassword(password);

    if (!isPasswordMatching) {
      return res.status(400).json({ message: "Invalid Password " });
    }
    const accessToken = generateAccesToken(user?._id);
    const refreshToken = generateRefreshToken(user?._id);
    // console.log(accessToken, refreshToken);
    user.refreshToken = refreshToken;
    user.markModified("refreshToken");
    await user.save();
    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };

    return res
      .cookie("accessToken", accessToken, {
        ...options,
        // domain: ".vercel.app",
        maxAge: 15 * 60 * 1000, // 15min
      })
      .cookie("refreshToken", refreshToken, {
        ...options,
        // domain: ".vercel.app",
        maxAge: 2 * 24 * 60 * 60 * 1000, // 2days
      })
      .status(200)
      .json({ message: "Logged In Successfully", user: user });
  } catch (error) {
    res.status(400).json({ message: error?.message });
  }
};

export const getUserDetails = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(409).json({ message: "User not found" });
    }
    const userDetail = await User.findById(user._id);

    if (!userDetail) {
      return res.status(409).json({ message: "User not found" });
    }
    return res.status(200).json({ message: "User Found!!", userDetail });
  } catch (error) {
    return res
      .status(400)
      .json({ message: error?.message || "Internal Server Error" });
  }
};
export const userLogout = async (req, res) => {
  try {
    const refreshToken = req?.cookies.refreshToken;

    const user = await User.findOne({ refreshToken });

    if (!user) {
      return res.status(401).json({ message: "user not found" });
    }
    user.refreshToken = null;
    await user.save();
    const options = {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };
    return res
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json({ message: "Logged out" });
  } catch (error) {
    return res
      .status(400)
      .json({ message: error?.message || "Internal Server Error" });
  }
};
