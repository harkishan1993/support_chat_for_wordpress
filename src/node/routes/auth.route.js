import express from "express";
import { login, logout, signup, getMe, updateUser, updateUserForAssignAssistance } from "../controllers/auth.controller.js";

const router = express.Router();
router.post("/me", getMe);
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post('/updateuser', updateUser)
router.post('/acceptuser', updateUserForAssignAssistance)
export default router;
