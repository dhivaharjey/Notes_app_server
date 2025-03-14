import express from "express";
import {
  getUserDetails,
  userLogin,
  userLogout,
  userRegister,
} from "../controllers/userController.js";
import { authentication } from "../middleware/authentication.js";

const userRouter = express.Router();

userRouter.post("/register", userRegister);
userRouter.post("/login", userLogin);
userRouter.route("/").get(authentication, getUserDetails);
userRouter.get("/check-auth", authentication, (req, res) => {
  return res.status(200).json({
    message: "token generated",
    user: req.user,
  });
});
userRouter.post("/logout", userLogout);

export default userRouter;
