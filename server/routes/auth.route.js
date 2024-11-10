import { Router } from "express";

import authController from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = Router();

export default router
    .post("/login", authController.login)
    .post("/signup", authController.signup)
    .post("/logout", authController.logout)
    .post("/verify-email", authController.verifyEmail)
    .post("forgot-password", authController.forgotPassword)
    .post("/reset-password:token", authController.resetPassword)
    .post("/verify-auth", verifyToken,authController.checkAuth);
