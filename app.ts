import "dotenv/config";
import path from "path";
import cors from "cors";
import express from "express";
import v1router from "./router";
import { Borgen, Logger } from "borgen";
import { ENV } from "./lib/environments";
import cookieParser from "cookie-parser";

export const allowedOrigins = ["http://localhost:8001"];

const app = express();

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.use(Borgen({}));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/api/v1", v1router);

app.listen(ENV.SERVER_PORT, () => {
  Logger.info({ message: `Server is running on port ${ENV.SERVER_PORT}` });
});
