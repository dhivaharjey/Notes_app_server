import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRouter from "./routes/userRouter.js";
import { connectDB } from "./db/db.js";
import notesRoute from "./routes/notesRoute.js";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cookieParser());
const allowedOrigins = [
  `${process.env.FRONTEND_DEPLOYED_URL}`,
  `${process.env.FRONTEND_UR}`,
];
console.log(process.env.FRONTEND_DEPLOYED_URL, "origin");

app.use(
  cors({
    // origin: "*",
    origin: function (origin, callback) {
      console.log("Request Origin:", origin);
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS Error"));
      }
    },
    credentials: true,
  })
);

connectDB();
app.get("/", (req, res) => res.send("App is Running Successfully"));
app.use("/auth", userRouter);
app.use("/notes", notesRoute);
app.listen(process.env.PORT || 3000, (req, res) => {
  console.log("Server is running on port ", process.env.PORT || 3000);
});
