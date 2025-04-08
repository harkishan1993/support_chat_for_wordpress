import express from "express";
import { getConversationByuserId, getMessages, getUserIdByconversationId, getUsersForSidebar, sendMessage, saveBotMessage,findOrCreateUser, getUserById} from "../controllers/message.controller.js";
const router = express.Router();
router.post("/conversations", getUsersForSidebar);
router.get("/:id", getMessages);
router.post("/send/:id", sendMessage);
router.post("/userbyconversation/:id",  getUserIdByconversationId);
router.post("/oneconversation",getConversationByuserId)
router.post("/botmessage", saveBotMessage);
router.post("/findOrCreateUser",findOrCreateUser)
router.post("/userbyid", getUserById)
export default router;
