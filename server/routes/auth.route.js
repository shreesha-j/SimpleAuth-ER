import { Router } from "express";

import authController from "../controllers/auth.controller.js";

const router = Router();

export default router
    .get("/login", authController.login)
    .get("/signup", authController.signup)
    .get("/logout", authController.logout);